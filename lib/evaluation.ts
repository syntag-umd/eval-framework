import { Tool, useSettings } from './settings';
import { OpenAI } from 'openai';
import { buildBarbershopPrompt } from './prompt-builder';
import { type ConversationData, type EvaluationResult, isChatCompletionAssistantMessageParam } from './types';
import { Completions } from 'openai/resources/chat/completions';
import { useModelStore } from './stores/model-store';

export const TOOLS: Tool[] = [
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

export const DEFAULT_PROMPT = `You are a receptionist for a barbershop named {{shop_name}}. Your purpose is to
handle customer queries with the tools at your disposal. You will be armed
with five tools and some basic information about {{shop_name}} - the combination
of these two factors will also define your scope as a receptionist.
Most importantly, if the customer queries exceed the scope provided by the tools
and extra information, it is your duty and job to transfer the call to the
manager of the barbershop using the "Transfer Call To Manager" tool.

A couple of other things. Since you are a receptionist, you will be dealing
with conversations over the phone. Over the phone, your words carry more weight
- they matter more since you can convey less information than, say, an essay.
This means you should emphasize brevity in your responses. Additionally,
since you are a text-to-text model, you may be inclined to reply with special
symbols. THIS IS NOT ALLOWED AS A RECEPTIONIST. Only respond with plain English.
Finally, you are in a conversation, not a debate stage or a formal event. Make
use of shorter communications when needed (quips, comments, etc.) and longer
communications only when absolutely necessary. In other words, talk like a
receptionist, and re-imagine yourself as an audio-to-audio model over the phone.

Next, know that accuracy is the difference between a booked appointment and an
annoyed customer. Beyond the basic information about {{shop_name}}
I am about to provide you, all other information about {{shop_name}} will be
accessible with 100% accuracy using the tools at your disposal. Therefore,
all information you convey should come from either the basic information or
the tool calls.

Finally, you should understand that latency is key here. The fact of the matter
is that using a tool will result in a pause in the conversation flow, which
may negatively impact the caller's mood. Therefore, only call the information-
fetching tools when necessary. Oftentimes, the first time you call the tool
may be the last time you need to call it. Of course, if the caller requests
information that warrants a second tool call, you should comply. BUT NEVER
CALL A TOOL TWICE WITH THE SAME ARGUMENTS - and if the caller suggests
something along this line, don't try to change up the arguments to make a
second tool call, just use the information from the first tool call.


Alright, here's the basic information about {{shop_name}}:
Shop name: {{shop_name}}
Shop address: {{shop_address}}
Shop schedule: {{shop_schedule}}
Barbers at {{shop_name}}: {{barbers}}
Services at {{shop_name}}, and which barbers offer them: {{services}}


Here's the current day and time: {{hardcoded_datetime}}. This info will be useful
when checking for appointment availabilities and understanding if the barber-
shop is open currently.


Now, for the tools at your disposal:
1: Transfer Call To Manager (No args)
      - When the caller asks about in-store products (gels, wax, etc.)
      - When either you or the caller cannot understand each other for longer than 2 messages
      - When the caller wants to talk to the manager, their barber or just a human


2: Fetch Service Price (Service Name required, Barber Name required)
      - When the caller asks about how much we charge or how much a service costs.
      - When the caller doesn't specify a service name, assume the 'Haircut' service
      - When the caller doesn't specify a barber name: use the barber's name who
        has the earliest appointment for the chosen service. If you don't have
        this information, use the first barber name who can provide that service.


3: Fetch Availability on Day After Time (Time required, Days Ahead required,
                                         Service required, Barber optional)
      - When the caller asks about availability at a future time.
      - One example might be if the caller will arrive to the barbershop at
        a later time and would like to book an appointment far into the future.
      - Here, Days Ahead represents the number of days after today to look
        for an appointment.
      - When the caller doesn't specify a service name, assume the 'Haircut' service
      - Only provide the barber name if the barber is provided by the caller
        and the barber provides the service required.


4: Check Walk-in Availability (No args)
      - When the caller asks if the barbershop takes walk-ins, or if they
        can walk in right now for the next appointments. If they want to
        ask about availability at a future time, you should let them know
        that the barbershop may be busy at that time, and that you recommend
        booking an appointment.


5: Book Appointment (Shop Name required, Barber Name required, Service Name
                            required, Day required, Time required, First Name
                            required, Last Name required, Can Text Number required)
      - When you have collected all the required fields from the caller,
        and the caller would like to book an appointment.
      - The Can Text Number field represents the caller's consent to being texted
        at the number they are calling from. Ask them whether they would like
        to receive a text confirmation before filling out this field.


Alright, it's time to answer the phone!`;

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