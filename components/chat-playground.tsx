"use client";

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { Bot, Download, Send, User, Wrench, Trash2, Edit2, Save, X } from "lucide-react";
import OpenAI from 'openai';
import { buildBarbershopPrompt } from '@/lib/prompt-builder';
import { Completions } from 'openai/resources/chat/completions';
import { isChatCompletionAssistantMessageParam } from '@/lib/types';
import { TOOLS } from '@/lib/evaluation';
import { ToolCallEditor } from './tool-call-editor';

interface PlaygroundProps {
  systemPrompt: string;
}

interface SavedConversation {
  input: Completions.ChatCompletionMessageParam[];
  output: {
    message: string;
    tool_calls: any[];
  };
  config: typeof DEFAULT_CONFIG;
}

const DEFAULT_CONFIG = {
  shop_name: "Cali's Finest Barberlounge",
  shop_address: "123 Barber Lane, Hairtown",
  shop_schedule: "Mon-Fri: 9am-6pm, Sat: 8am-6pm, Sun: 7am-3pm",
  barbers: [
    { name: "John", services: ["Haircut", "Shave", "Trim"] },
    { name: "Mike", services: ["Haircut", "Beard Styling"] },
    { name: "Sarah", services: ["Haircut", "Coloring", "Styling"] }
  ],
  services: {
    Haircut: ["John", "Mike", "Sarah"],
    Shave: ["John"],
    Trim: ["John"],
    Beard_Styling: ["Mike"],
    Coloring: ["Sarah"],
    Styling: ["Sarah"]
  },
  hardcoded_datetime: new Date().toISOString()
};

export function ChatPlayground({ systemPrompt }: PlaygroundProps) {
  const [messages, setMessages] = useState<Completions.ChatCompletionMessageParam[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [awaitingToolResponse, setAwaitingToolResponse] = useState<string | null>(null);
  const [savedConversations, setSavedConversations] = useState<{ [key: string]: SavedConversation }>({});
  const [editingMessageIndex, setEditingMessageIndex] = useState<number | null>(null);
  const [editContent, setEditContent] = useState('');
  const [editingToolCall, setEditingToolCall] = useState<{ index: number; toolCall: any } | null>(null);

  const initializeSystemMessage = () => {
    setMessages([
      { 
        role: 'system', 
        content: `This is ${DEFAULT_CONFIG.shop_name}, how can I help you?` 
      }
    ]);
  };

  useEffect(() => {
    initializeSystemMessage();
  }, []);

  const renderToolCalls = (toolCalls: any[], messageIndex: number) => {
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
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Wrench className="h-4 w-4" />
              <span className="font-medium">{tool.function?.name}</span>
            </div>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setEditingToolCall({ index: messageIndex, toolCall: tool })}
            >
              <Edit2 className="h-3 w-3" />
            </Button>
          </div>
          <div className="mt-1 font-mono text-xs overflow-x-auto whitespace-pre-wrap break-all">
            {JSON.stringify(parsedArgs, null, 2)}
          </div>
        </div>
      );
    });
  };

  const handleSubmit = async () => {
    if (!input.trim()) return;

    let newMessage: Completions.ChatCompletionMessageParam;
    
    if (awaitingToolResponse) {
      // Format tool response correctly
      newMessage = {
        role: 'tool',
        content: input,
        tool_call_id: awaitingToolResponse,
      };
      setAwaitingToolResponse(null);
    } else {
      newMessage = {
        role: 'user',
        content: input
      };
    }

    setMessages(prev => [...prev, newMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const openai = new OpenAI({
        apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
        dangerouslyAllowBrowser: true
      });

      const formattedPrompt = buildBarbershopPrompt(DEFAULT_CONFIG, systemPrompt);
      
      const allMessages = [
        { role: 'system', content: formattedPrompt },
        ...messages,
        newMessage
      ] as Completions.ChatCompletionMessageParam[];

      const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: allMessages,
        tools: TOOLS
      });

      const assistantMessage = response.choices[0].message;
      setMessages(prev => [...prev, assistantMessage]);

      if (assistantMessage.tool_calls && assistantMessage.tool_calls.length > 0) {
        setAwaitingToolResponse(assistantMessage.tool_calls[0].id);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearConversation = () => {
    initializeSystemMessage();
    setInput('');
    setAwaitingToolResponse(null);
    setEditingMessageIndex(null);
    setEditContent('');
    setEditingToolCall(null);
  };

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

    return null;
  };

  const handleSaveConversation = () => {
    if (messages.length === 0) return;

    const lastMessage = messages[messages.length - 1];
    const conversationId = `conversation_${Object.keys(savedConversations).length + 1}`;
    
    const processedMessages = messages.map(msg => {
      if (isChatCompletionAssistantMessageParam(msg) && msg.tool_calls) {
        return {
          ...msg,
          tool_calls: msg.tool_calls.map(tool => ({
            ...tool,
            function: {
              ...tool.function,
              arguments: typeof tool.function.arguments === 'string' 
                ? JSON.parse(tool.function.arguments)
                : tool.function.arguments
            }
          }))
        };
      }
      return msg;
    });
    
    setSavedConversations(prev => ({
      ...prev,
      [conversationId]: {
        input: processedMessages.slice(0, -1),
        output: {
          message: typeof lastMessage.content === 'string' ? lastMessage.content : '',
          tool_calls: isChatCompletionAssistantMessageParam(lastMessage)
            ? lastMessage.tool_calls?.map(tool => ({
                ...tool,
                function: {
                  ...tool.function,
                  arguments: typeof tool.function.arguments === 'string'
                    ? JSON.parse(tool.function.arguments)
                    : tool.function.arguments
                }
              })) || []
            : [],
        },
        config: DEFAULT_CONFIG
      }
    }));
  };

  const handleDownloadDataset = () => {
    const blob = new Blob([JSON.stringify(savedConversations, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'conversation-dataset.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setSavedConversations({});
  };

  const handleDeleteMessage = (index: number) => {
    setMessages(prev => prev.filter((_, i) => i !== index));
    setEditingMessageIndex(null);
  };

  const handleEditMessage = (index: number) => {
    const message = messages[index];
    setEditContent(typeof message.content === 'string' ? message.content : '');
    setEditingMessageIndex(index);
  };

  const handleSaveEdit = (index: number) => {
    setMessages(prev => prev.map((msg, i) => 
      i === index ? { ...msg, content: editContent } : msg
    ));
    setEditingMessageIndex(null);
    setEditContent('');
  };

  const handleSaveToolCall = (messageIndex: number, updatedToolCall: any) => {
    setMessages(prev => prev.map((msg, i) => {
      if (i === messageIndex && isChatCompletionAssistantMessageParam(msg)) {
        return {
          ...msg,
          tool_calls: msg.tool_calls?.map(tool => 
            tool.id === updatedToolCall.id ? updatedToolCall : tool
          )
        };
      }
      return msg;
    }));
    setEditingToolCall(null);
  };

  return (
    <Card className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Chat Playground</h2>
        <div className="flex gap-2">
          {messages.length > 0 && (
            <>
              <Button variant="outline" onClick={handleSaveConversation}>
                <Save className="h-4 w-4 mr-2" />
                Save Conversation
              </Button>
              {Object.keys(savedConversations).length > 0 && (
                <Button variant="outline" onClick={handleDownloadDataset}>
                  <Download className="h-4 w-4 mr-2" />
                  Download Dataset ({Object.keys(savedConversations).length})
                </Button>
              )}
              <Button variant="destructive" onClick={handleClearConversation}>
                <Trash2 className="h-4 w-4 mr-2" />
                Clear
              </Button>
            </>
          )}
        </div>
      </div>

      <ScrollArea className="h-[400px] mb-4 rounded-md border p-4">
        <div className="space-y-4 max-w-3xl mx-auto">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex gap-4 ${message.role === "user" ? "justify-end" : ""}`}
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
                <div className="flex-1">
                  <div
                    className={`rounded-lg p-4 ${
                      message.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : message.role === "tool"
                        ? "bg-orange-500/10 border border-orange-500/20"
                        : "bg-muted"
                    }`}
                  >
                    {editingMessageIndex === index ? (
                      <div className="flex flex-col gap-2">
                        <Textarea
                          value={editContent}
                          onChange={(e) => setEditContent(e.target.value)}
                          className="min-h-[100px] bg-background"
                        />
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setEditingMessageIndex(null)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleSaveEdit(index)}
                          >
                            <Save className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <>
                        {renderContent(message.content)}
                        {isChatCompletionAssistantMessageParam(message) && 
                          message.tool_calls && 
                          renderToolCalls(message.tool_calls, index)}
                      </>
                    )}
                  </div>
                  {!editingMessageIndex && (message.role === 'user' || message.role === 'assistant' || message.role === 'tool') && (
                    <div className="flex justify-end gap-2 mt-1">
                      {(message.role === 'user' || message.role === 'assistant') && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleEditMessage(index)}
                        >
                          <Edit2 className="h-3 w-3" />
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDeleteMessage(index)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center animate-pulse">
                <Bot className="h-4 w-4" />
              </div>
              <div className="rounded-lg p-4 bg-muted animate-pulse">
                Thinking...
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {editingToolCall && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="max-w-lg w-full">
            <ToolCallEditor
              toolCall={editingToolCall.toolCall}
              onSave={(updatedToolCall) => handleSaveToolCall(editingToolCall.index, updatedToolCall)}
              onCancel={() => setEditingToolCall(null)}
            />
          </div>
        </div>
      )}

      <div className="flex gap-2 max-w-3xl mx-auto">
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={awaitingToolResponse 
            ? "Enter tool response..." 
            : "Type your message..."}
          className="resize-none"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSubmit();
            }
          }}
        />
        <Button onClick={handleSubmit} disabled={isLoading}>
          <Send className="h-4 w-4" />
        </Button>
      </div>
      {awaitingToolResponse && (
        <p className="text-sm text-muted-foreground mt-2 text-center">
          Waiting for tool response... Please provide the result of the tool call.
        </p>
      )}
    </Card>
  );
}