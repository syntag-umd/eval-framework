import { OpenAI } from 'openai';
import { buildBarbershopPrompt } from './prompt-builder';
import { type ConversationData, type EvaluationResult, isChatCompletionAssistantMessageParam } from './types';
import { Completions } from 'openai/resources/chat/completions';

export const TOOLS: Completions.ChatCompletionTool[] = [
  {
    type: 'function',
    function: {
      name: 'transfer_call_to_manager',
      description: 'Call this function to transfer the phone to the manager.',
      parameters: {
        type: 'object',
        properties: {},
        required: [],
        additionalProperties: false,
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'fetch_service_price',
      description: 'Call this function when a customer asks for the price of a service.',
      parameters: {
        type: 'object',
        properties: {
          service: {
            description: 'The name of the service. Required.',
            type: 'string',
          },
          barber: {
            description: 'The name of the barber. Required.',
            type: 'string',
          },
        },
        required: ['service', 'barber'],
        additionalProperties: false,
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'fetch_availability_on_day_after_time',
      description: 'Call this function when a customer asks for the availability after a specific time.',
      parameters: {
        type: 'object',
        properties: {
          time: {
            description: 'HH:MM format.',
            type: 'string',
          },
          days_after_today: {
            description: 'Positive Integer.',
            type: 'integer',
          },
          service: {
            description: 'The name of the service.',
            type: 'string',
          },
          barber: {
            description: 'The name of the barber.',
            type: 'string',
          },
        },
        required: ['time', 'days_after_today', 'service'],
        additionalProperties: false,
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'check_walkin_availability',
      description: 'Call this function when a customer asks for walk-in availability.',
      parameters: {
        type: 'object',
        properties: {},
        required: [],
        additionalProperties: false,
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'book_appointment',
      description: 'This function allows booking an appointment with a specified barber and service at a given time.',
      parameters: {
        type: 'object',
        properties: {
          barber: {
            description: 'The name of the barber.',
            type: 'string',
          },
          service: {
            description: 'The name of the service.',
            type: 'string',
          },
          day: {
            description: "Specify a day of the week (i.e., 'Monday', 'Tuesday', etc.).",
            type: 'string',
          },
          time: {
            description: 'HH:MM format',
            type: 'string',
          },
          firstName: {
            description: 'The first name of the client booking the appointment.',
            type: 'string',
          },
          lastName: {
            description: 'The last name of the client booking the appointment.',
            type: 'string',
          },
          canTextNumber: {
            description:
              'Whether or not the user consents to receiving a text confirmation of their appointment.',
            type: 'boolean',
          },
        },
        required: [
          'barber',
          'service',
          'day',
          'time',
          'firstName',
          'lastName',
          'canTextNumber',
        ],
        additionalProperties: false,
      },
    },
  },
];

export const DEFAULT_PROMPT = `You are a receptionist for {{shop_name}}. Your purpose is to handle customer queries professionally and efficiently.

Shop Information:
- Name: {{shop_name}}
- Address: {{shop_address}}
- Schedule: {{shop_schedule}}

Available Barbers: {{barbers}}
Available Services: {{services}}

Current time: {{hardcoded_datetime}}

Remember:
1. Keep responses brief and clear - you're on a phone call
2. Use only plain English, no special symbols
3. Use shorter responses for simple queries
4. Only use tools when necessary
5. Never call a tool twice with the same arguments

If a query exceeds your scope or tools, transfer the call to the manager.`;

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

      // Compare the stringified versions of the arguments
      return JSON.stringify(genArgs) === JSON.stringify(idealArgs);
    } catch {
      return false;
    }
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
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0,
      max_tokens: 10,
    });

    const rating = parseInt(response.choices[0].message?.content?.trim() || '0', 10);
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
  onProgress?: (progress: number) => void
): Promise<EvaluationResult[]> => {
  const total = conversations.length;
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
      const systemPrompt = buildBarbershopPrompt(conversation.config, defaultPrompt);
      const messages: MessageType[] = [
        { role: 'system', content: systemPrompt },
        ...conversation.input
      ];
      const sanitizedMessages = sanitizeMessages(messages);
      
      const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: sanitizedMessages,
        tools: TOOLS,
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

      return {
        index,
        score: 0,
        conversation: conversation.input,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  };

  const results = await Promise.all(
    conversations.map((conv, index) => evaluateConversation(conv, index))
  );

  return results.sort((a, b) => a.index - b.index);
};