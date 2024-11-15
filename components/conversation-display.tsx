"use client";

import { Bot, User, Wrench } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Completions } from 'openai/resources/chat/completions';
import {isChatCompletionAssistantMessageParam} from "@/lib/types"

interface ConversationDisplayProps {
  messages: Completions.ChatCompletionMessageParam[];
  generatedMessage?: string;
  idealMessage?: string;
  generatedToolCalls?: any[];
  idealToolCalls?: any[];
}


const renderContent = (content: Completions.ChatCompletionMessageParam['content']): React.ReactNode => {
  if (typeof content === 'string') {
    return content;
  }

  if (Array.isArray(content)) {
    return content.map((part, index) => {
      if ('text' in part) {
        return <span key={index}>{part.text}</span>;
      } else if ('reason' in part) {
        return <span key={index} style={{ color: 'red' }}>{String(part.reason)}</span>;
      } else {
        return null;
      }
    });
  }


  // Handle null or undefined
  return null;
};

export function ConversationDisplay({
  messages,
  generatedMessage,
  idealMessage,
  generatedToolCalls,
  idealToolCalls,
}: ConversationDisplayProps) {
  const renderToolCalls = (toolCalls: any[]) => {
    return toolCalls.map((tool: any, i: number) => (
      <div key={`tool-${i}`} className="mt-2 text-sm opacity-80 border-t pt-2">
        <div className="flex items-center gap-2">
          <Wrench className="h-4 w-4" />
          <span className="font-medium">{tool.name || tool.function?.name}</span>
        </div>
        <div className="mt-1 font-mono text-xs">
          {JSON.stringify(tool.arguments || tool.function?.arguments, null, 2)}
        </div>
      </div>
    ));
  };

  const renderMessage = (message: Completions.ChatCompletionMessageParam | { role: string; content: string }, index: number, isComparison = false) => (
    <div key={`message-${index}`} className={`flex gap-4 ${message.role === "user" ? "justify-end" : ""}`}>
      <div className={`flex gap-3 max-w-[80%] ${message.role === "user" ? "flex-row-reverse" : ""}`}>
        <div
          className={`w-8 h-8 rounded-full flex items-center justify-center ${
            message.role === "user"
              ? "bg-primary text-primary-foreground"
              : message.role === "tool"
              ? "bg-orange-500 text-white"
              : isComparison
              ? "bg-green-500 text-white"
              : "bg-muted"
          }`}
        >
          {message.role === "user" ? (
            <User className="h-4 w-4" />
          ) : message.role === "tool" ? (
            <Wrench className="h-4 w-4" />
          ) : (
            <Bot className="h-4 w-4" />
          )}
        </div>
        <div
          className={`rounded-lg p-4 ${
            message.role === "user"
              ? "bg-primary text-primary-foreground"
              : message.role === "tool"
              ? "bg-orange-500/10 border border-orange-500/20"
              : isComparison
              ? "bg-green-500/10 border border-green-500/20"
              : "bg-muted"
          }`}
        >
          {renderContent(message.content)}
          {isChatCompletionAssistantMessageParam(message) && message.tool_calls && renderToolCalls(message.tool_calls)}
        </div>
      </div>
    </div>
  );

  return (
    <ScrollArea className="h-[400px] rounded-md border p-4">
      <div className="space-y-4">
        {messages.map((message, index) => renderMessage(message, index))}

        {(generatedMessage || generatedToolCalls?.length) && (
          <div key="generated-response" className="border-t border-dashed pt-4 mt-4">
            <h4 className="text-sm font-medium mb-2">Generated Response:</h4>
            {renderMessage({ role: "assistant", content: generatedMessage || "" }, messages.length, true)}
            {generatedToolCalls && generatedToolCalls.length > 0 && (
              <div className="mt-2">{renderToolCalls(generatedToolCalls)}</div>
            )}
          </div>
        )}

        {(idealMessage || idealToolCalls?.length) && (
          <div key="ideal-response" className="border-t border-dashed pt-4 mt-4">
            <h4 className="text-sm font-medium mb-2">Ideal Response:</h4>
            {renderMessage({ role: "assistant", content: idealMessage || "" }, messages.length + 1, true)}
            {idealToolCalls && idealToolCalls.length > 0 && (
              <div className="mt-2">{renderToolCalls(idealToolCalls)}</div>
            )}
          </div>
        )}
      </div>
    </ScrollArea>
  );
}