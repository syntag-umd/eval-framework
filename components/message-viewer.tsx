"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChevronLeft, ChevronRight, Bot, User, Wrench } from "lucide-react";
import { Completions } from 'openai/resources/chat/completions';
import {isChatCompletionAssistantMessageParam} from "@/lib/types"

interface ConversationData {
  input: Completions.ChatCompletionMessageParam[];
  output: {
    message: string;
    tool_calls: any[];
  };
}

interface MessageViewerProps {
  conversation: ConversationData;
  currentIndex: number;
  total: number;
  onPrevious: () => void;
  onNext: () => void;
  dialogId: string;
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

export function MessageViewer({
  conversation,
  currentIndex,
  total,
  onPrevious,
  onNext,
  dialogId,
}: MessageViewerProps) {
  const renderToolCalls = (toolCalls: any[]) => {
    return toolCalls.map((tool: any, i: number) => {
      // Parse arguments if they're a string
      let parsedArgs = tool.function?.arguments || {};
      if (typeof parsedArgs === 'string') {
        try {
          parsedArgs = JSON.parse(parsedArgs);
        } catch (e) {
          console.error('Failed to parse arguments:', e);
        }
      }
  
      return (
        <div key={i} className="mt-2 text-sm opacity-80 border-t pt-2">
          <div className="flex items-center gap-2">
            <Wrench className="h-4 w-4" />
            <span className="font-medium">{tool.name || tool.function?.name}</span>
          </div>
          <div className="mt-1 font-mono text-xs overflow-x-auto whitespace-pre-wrap break-all">
            {JSON.stringify(parsedArgs, null, 2)}
          </div>
        </div>
      );
    });
  };
  

  return (
    <Card className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-semibold">
            Dialog {dialogId}
          </h2>
          <p className="text-sm text-muted-foreground">
            Conversation {currentIndex + 1} of {total}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={onPrevious}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={onNext}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <ScrollArea className="h-[600px] pr-4">
        <div className="space-y-4">
          {conversation.input.map((message, index) => (
            <div
              key={index}
              className={`flex gap-4 ${
                message.role === "user" ? "justify-end" : ""
              }`}
            >
              <div
                className={`flex gap-3 max-w-[80%] ${
                  message.role === "user" ? "flex-row-reverse" : ""
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    message.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : message.role === "tool"
                      ? "bg-orange-500 text-white"
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
                      : "bg-muted"
                  }`}
                >
                  {renderContent(message.content)}
                  {isChatCompletionAssistantMessageParam(message) && message.tool_calls && renderToolCalls(message.tool_calls)}
                </div>
              </div>
            </div>
          ))}

          {(conversation.output.message || conversation.output.tool_calls.length > 0) && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                <Bot className="h-4 w-4" />
              </div>
              <div className="rounded-lg p-4 bg-muted">
                {conversation.output.message}
                {conversation.output.tool_calls.length > 0 && 
                  renderToolCalls(conversation.output.tool_calls)
                }
              </div>
            </div>
          )}
        </div>
      </ScrollArea>
    </Card>
  );
}