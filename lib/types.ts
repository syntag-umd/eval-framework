import { Completions } from 'openai/resources/chat/completions';

export const isChatCompletionAssistantMessageParam = (
  message: Completions.ChatCompletionMessageParam | { role: string; content: string; }
): message is Completions.ChatCompletionAssistantMessageParam => {
  return message.role === 'assistant' && Array.isArray((message as Completions.ChatCompletionAssistantMessageParam).tool_calls);
};

type ChatCompletionMessageParam = Completions.ChatCompletionMessageParam;

export interface Barber {
  name: string;
  services: string[];
}

export interface Services {
  [serviceName: string]: string[];
}

export interface ConversationConfig {
  config: Record<string, any>;
}

export interface ConversationData {
  config: Record<string, any>;
  input: Completions.ChatCompletionMessageParam[];
  output: {
    message: string;
    tool_calls: any[];
  };
}

export interface Conversations {
  [key: string]: ConversationData;
}

export interface EvaluationResult {
  index: number;
  score: number;
  error?: string;
  conversation: Completions.ChatCompletionMessageParam[];
  config: Record<string, any>;
  prompt: string;
  details?: {
    generatedMessage?: string;
    idealMessage?: string;
    generatedToolCalls?: any[];
    idealToolCalls?: any[];
  };
}