import { Tool, useSettings } from './settings';
import { OpenAI } from 'openai';
import { buildSystemPrompt } from './prompt-builder';
import { type ConversationData, type EvaluationResult, isChatCompletionAssistantMessageParam } from './types';
import { Completions } from 'openai/resources/chat/completions';
import { useModelStore } from './stores/model-store';

const evaluateToolCalls = (
  generatedToolCalls: any[],
  idealToolCalls: any[]
): boolean => {
  if (generatedToolCalls.length !== idealToolCalls.length) return false;

  return generatedToolCalls.every((genTool, index) => {
    const idealTool = idealToolCalls[index];

    // Compare tool names
    const genName = genTool.function?.name || genTool.name;
    const idealName = idealTool.function?.name || idealTool.name;
    if (genName !== idealName) return false;

    try {
      // Get arguments from the appropriate location
      let genArgs = genTool.function?.arguments || genTool.arguments;
      let idealArgs = idealTool.function?.arguments || idealTool.arguments;

      // Convert string arguments to objects if needed
      if (typeof genArgs === 'string') {
        genArgs = JSON.parse(genArgs);
      }
      if (typeof idealArgs === 'string') {
        idealArgs = JSON.parse(idealArgs);
      }

      // Convert all values to strings for consistent comparison
      const stringifyValues = (obj: any): any => {
        if (obj === null || obj === undefined) return '';
        if (typeof obj !== 'object') return String(obj);
        
        const result: any = Array.isArray(obj) ? [] : {};
        for (const key in obj) {
          result[key] = stringifyValues(obj[key]);
        }
        return result;
      };

      const normalizedGenArgs = stringifyValues(genArgs);
      const normalizedIdealArgs = stringifyValues(idealArgs);

      return JSON.stringify(normalizedGenArgs) === JSON.stringify(normalizedIdealArgs);
    } catch {
      return false;
    }
  });
};


const createTimeoutPromise = (timeoutMs: number) => {
  return new Promise((_, reject) => {
    setTimeout(() => {
      reject(new Error(`Operation timed out after ${timeoutMs}ms`));
    }, timeoutMs);
  });
};

export const evaluateMessageSimilarity = async (
  openai: OpenAI,
  generatedMessage: string,
  idealMessage: string,
  comparisonPrompt: string
): Promise<number> => {
  const prompt = comparisonPrompt
    .replace('{{generated_message}}', generatedMessage || 'None')
    .replace('{{ideal_message}}', idealMessage || 'None');

  try {
    const response = await Promise.race([
      openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0,
        max_tokens: 10,
      }),
      createTimeoutPromise(10000) // 10 second timeout
    ]);

    const rating = parseInt((response as any).choices[0].message?.content?.trim() || '0', 10);
    return isNaN(rating) ? 0 : Math.max(0, Math.min(rating, 100));
  } catch (error) {
    console.error('Error evaluating message similarity:', error);
    return 0;
  }
};

type MessageType = Completions.ChatCompletionMessageParam;
type ToolCallType = Completions.ChatCompletionMessageToolCall;

export const evaluateConversations = async (
  openai: OpenAI,
  conversations: Array<[string, ConversationData]>,
  defaultPrompt: string,
  comparisonPrompt: string,
  tools: Tool[],
  onProgress?: (progress: number) => void,
  specificIndices?: number[]
): Promise<EvaluationResult[]> => {
  const total = specificIndices ? specificIndices.length : conversations.length;
  let completed = 0;

  const sanitizeMessages = (messages: MessageType[]): MessageType[] => {
    return messages.map((message) => {
      if (isChatCompletionAssistantMessageParam(message)) {
        const sanitizedToolCalls = message.tool_calls?.map((toolCall) => {
          if (
            toolCall.function &&
            toolCall.function.arguments &&
            typeof toolCall.function.arguments === 'object'
          ) {
            return {
              ...toolCall,
              function: {
                ...toolCall.function,
                arguments: JSON.stringify(toolCall.function.arguments),
              },
            };
          }
          return toolCall;
        });
  
        return {
          ...message,
          tool_calls: sanitizedToolCalls,
        };
      }
  
      return message;
    });
  };

  const parseToolCalls = (toolCalls: Array<ToolCallType>): Array<ToolCallType> => {
    return toolCalls.map((toolCall, tcIndex) => {
      if (
        toolCall.function &&
        typeof toolCall.function.arguments === 'string'
      ) {
        try {
          return {
            ...toolCall,
            function: {
              ...toolCall.function,
              arguments: JSON.parse(toolCall.function.arguments),
            },
          };
        } catch (parseError) {
          console.error(
            `Failed to parse function.arguments for tool_call[${tcIndex}] in message:`,
            toolCall
          );
          return toolCall;
        }
      }
      return toolCall;
    });
  };

  const evaluateConversation = async (
    [key, conversation]: [string, ConversationData],
    index: number
  ): Promise<EvaluationResult> => {
    try {
      const systemPrompt = buildSystemPrompt(conversation.config, defaultPrompt);
      const messages: MessageType[] = [
        { role: 'system', content: systemPrompt },
        ...conversation.input
      ];
      const sanitizedMessages = sanitizeMessages(messages);
      
      const { evaluationModel } = useModelStore.getState();
      const response = await openai.chat.completions.create({
        model: evaluationModel,
        messages: sanitizedMessages,
        tools: tools
      });

      const responseMessage = response.choices[0].message as Completions.ChatCompletionMessage;
      const generatedContent = responseMessage?.content || '';
      let generatedToolCalls: Completions.ChatCompletionMessageToolCall[] = [];

      if (responseMessage.tool_calls) {
        generatedToolCalls = responseMessage.tool_calls;
      }

      generatedToolCalls = parseToolCalls(generatedToolCalls);

      const idealResponse = conversation.output;
      const idealMessage = idealResponse.message;
      const idealToolCalls = idealResponse.tool_calls;

      const toolsCorrect = evaluateToolCalls(
        generatedToolCalls,
        idealToolCalls
      );
      const missingMessage = !generatedContent && idealMessage;

      let result: EvaluationResult;

      if (!toolsCorrect || missingMessage) {
        result = {
          index,
          score: 0,
          conversation: conversation.input,
          config: conversation.config,
          prompt: systemPrompt,
          error: 'Tool calls mismatch or missing required message',
          details: {
            generatedMessage: generatedContent,
            idealMessage,
            generatedToolCalls,
            idealToolCalls,
          },
        };
      } else {
        const score = await evaluateMessageSimilarity(
          openai,
          generatedContent,
          idealMessage,
          comparisonPrompt
        );
        result = {
          index,
          score,
          conversation: conversation.input,
          config: conversation.config,
          prompt: systemPrompt,
          details: {
            generatedMessage: generatedContent,
            idealMessage,
            generatedToolCalls,
            idealToolCalls,
          },
        };
      }

      completed++;
      if (onProgress) {
        onProgress((completed / total) * 100);
      }

      return result;
    } catch (error) {
      completed++;
      if (onProgress) {
        onProgress((completed / total) * 100);
      }
      const systemPrompt = buildSystemPrompt(conversation.config, defaultPrompt);

      return {
        index,
        score: 0,
        conversation: conversation.input,
        config: conversation.config,
        prompt: systemPrompt,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  };

  // If specificIndices is provided, only evaluate those conversations
  const conversationsToEvaluate = specificIndices
    ? conversations.filter((_, index) => specificIndices.includes(index))
    : conversations;

  const results = await Promise.all(
    conversationsToEvaluate.map((conv, idx) => {
      const originalIndex = specificIndices 
        ? specificIndices[idx]
        : idx;
      return evaluateConversation(conv, originalIndex);
    })
  );

  return results;
};