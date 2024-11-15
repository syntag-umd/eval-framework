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

export interface ShopConfig {
  shop_name: string;
  shop_address: string;
  shop_schedule: string;
  barbers: Barber[];
  services: Services;
  hardcoded_datetime: string;
}

export interface ConversationConfig {
  config: ShopConfig;
}

export interface ConversationData {
  config: ShopConfig;
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
  details?: {
    generatedMessage?: string;
    idealMessage?: string;
    generatedToolCalls?: any[];
    idealToolCalls?: any[];
  };
}
