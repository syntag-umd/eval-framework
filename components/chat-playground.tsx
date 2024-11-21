"use client";

import { useSettings } from '@/lib/settings';
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bot, Download, User, Wrench, Trash2, Edit2, Save, Settings2, SaveAll } from "lucide-react";
import OpenAI from 'openai';
import { buildBarbershopPrompt } from '@/lib/prompt-builder';
import { Completions } from 'openai/resources/chat/completions';
import { isChatCompletionAssistantMessageParam } from "@/lib/types";
import { MessageInput } from './message-input';
import { MessageEditor } from './message-editor';
import { ToolCallModal } from './tool-call-modal';
import { ConfigEditorModal } from './config-editor-modal';
import { useConversationStore } from '@/lib/stores/conversation-store';
import { useCurrentConversationStore } from '@/lib/stores/current-conversation-store';
import { useModelStore } from '@/lib/stores/model-store';
import { ModelSelector } from './model-selector';

interface PlaygroundProps {
  systemPrompt: string;
}

export function ChatPlayground({ systemPrompt }: PlaygroundProps) {
  // Local state
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [editingMessageIndex, setEditingMessageIndex] = useState<number | null>(null);
  const [isToolCallModalOpen, setIsToolCallModalOpen] = useState(false);
  const [editingToolCall, setEditingToolCall] = useState<any>(null);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [savedMessageIndices, setSavedMessageIndices] = useState<Set<number>>(new Set());

  // Global state
  const { tools, apiKey } = useSettings();
  const { chatModel, setChatModel } = useModelStore();
  const { savedConversations, addConversation, clearConversations } = useConversationStore();
  const {
    messages,
    currentConfig,
    pendingToolCalls,
    awaitingToolResponse,
    setMessages,
    addMessage,
    updateMessage,
    deleteMessage,
    setCurrentConfig,
    setPendingToolCalls,
    setAwaitingToolResponse,
    clearConversation
  } = useCurrentConversationStore();

  // Initialize system message
  const initializeSystemMessage = () => {
    setMessages([
      { 
        role: 'system', 
        content: `This is ${currentConfig.shop_name}, how can I help you?` 
      }
    ]);
    setPendingToolCalls([]);
    setAwaitingToolResponse(null);
  };

  // Initialize on component mount
  useEffect(() => {
    if (messages.length === 0) {
      initializeSystemMessage();
    }
  }, []);

  // Handle configuration save
  const handleConfigSave = (newConfig: typeof currentConfig) => {
    setCurrentConfig(newConfig);
    initializeSystemMessage();
  };

  // Get all tool call IDs
  const getToolCallIds = () => {
    const ids: string[] = [];
    messages.forEach(message => {
      if (isChatCompletionAssistantMessageParam(message) && message.tool_calls) {
        message.tool_calls.forEach(tool => {
          if (tool.id) ids.push(tool.id);
        });
      }
    });
    return ids;
  };

  // Render tool calls
  const renderToolCalls = (toolCalls: any[], messageIndex: number) => {
    return toolCalls.map((tool: any, i: number) => {
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
              <span className="text-xs text-muted-foreground">ID: {tool.id}</span>
            </div>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                setEditingToolCall(tool);
                setEditingIndex(messageIndex);
                setIsToolCallModalOpen(true);
              }}
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

  // Handle message submission
  const handleSubmit = async (isToolResponse: boolean, toolCallId?: string) => {
    if (!input.trim()) return;

    let newMessage: Completions.ChatCompletionMessageParam;
    
    if (isToolResponse && toolCallId) {
      newMessage = {
        role: 'tool',
        content: input,
        tool_call_id: toolCallId,
      };

      // Remove the responded tool call ID from pendingToolCalls
      setPendingToolCalls(pendingToolCalls.filter(id => id !== toolCallId));
      if (awaitingToolResponse === toolCallId) {
        setAwaitingToolResponse(null);
      }
    } else {
      if (pendingToolCalls.length > 0) {
        console.warn('There are pending tool calls that need to be responded to first');
        return;
      }

      newMessage = {
        role: 'user',
        content: input
      };
    }

    addMessage(newMessage);
    setInput('');
    setIsLoading(true);

    try {
      const openai = new OpenAI({
        apiKey: apiKey,
        dangerouslyAllowBrowser: true
      });

      const formattedPrompt = buildBarbershopPrompt(currentConfig, systemPrompt);
      const allMessages = [
        { role: 'system', content: formattedPrompt },
        ...messages,
        newMessage
      ] as Completions.ChatCompletionMessageParam[];

      const response = await openai.chat.completions.create({
        model: chatModel,
        messages: allMessages,
        tools: tools
      });

      const assistantMessage = response.choices[0].message;
      addMessage(assistantMessage);

      if (assistantMessage.tool_calls && assistantMessage.tool_calls.length > 0) {
        const newToolCallIds = assistantMessage.tool_calls.map(tool => tool.id!);
        setPendingToolCalls([...pendingToolCalls, ...newToolCallIds]);
        setAwaitingToolResponse(newToolCallIds[0]);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle clearing the conversation
  const handleClearConversation = () => {
    clearConversation();
    setInput('');
    setEditingMessageIndex(null);
    setSavedMessageIndices(new Set());
  };

  // Render message content
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

  // Handle saving messages up to a specific index
  const handleSaveUpToIndex = (index: number) => {
    if (messages.length === 0) return;

    const conversationId = `conversation_${Object.keys(savedConversations).length + 1}`;
    
    const processedMessages = messages.slice(0, index + 1).map(msg => {
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

    const lastMessage = messages[index];
    
    addConversation(conversationId, {
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
      config: currentConfig
    });

    setSavedMessageIndices(prev => {
      const newSet = new Set(prev);
      newSet.add(index);
      return newSet;
    });
  };

  // Handle saving the entire conversation
  const handleSaveConversation = () => {
    if (messages.length === 0) return;
    handleSaveUpToIndex(messages.length - 1);
  };

  // Handle downloading the dataset
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
    clearConversations();
  };

  // Handle deleting a message
  const handleDeleteMessage = (index: number) => {
    deleteMessage(index);
    setEditingMessageIndex(null);
  };

  // Handle editing a message
  const handleEditMessage = (index: number) => {
    setEditingMessageIndex(index);
  };

  // Handle saving an edited message
  const handleSaveEdit = (index: number, content: string, isToolCall: boolean, toolCall?: any) => {
    const updatedMessage = isToolCall ? {
      role: 'assistant' as const,
      content: '',
      tool_calls: [toolCall]
    } : {
      ...messages[index],
      content
    };
    updateMessage(index, updatedMessage);
    setEditingMessageIndex(null);
  };

  // Handle saving an edited tool call
  const handleToolCallSave = (toolCall: any) => {
    if (editingIndex !== null) {
      const message = messages[editingIndex];
      if (isChatCompletionAssistantMessageParam(message)) {
        const updatedMessage = {
          ...message,
          tool_calls: message.tool_calls?.map(tc => 
            tc.id === toolCall.id ? toolCall : tc
          )
        };
        updateMessage(editingIndex, updatedMessage);
      }
    }
    setIsToolCallModalOpen(false);
    setEditingToolCall(null);
    setEditingIndex(null);
  };

  return (
    <Card className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-semibold">Chat Playground</h2>
          <ModelSelector value={chatModel} onValueChange={setChatModel} />
        </div>
        <div className="flex gap-2">
          {messages.length > 0 && (
            <>
              <Button variant="outline" onClick={handleSaveConversation}>
                <SaveAll className="h-4 w-4 mr-2" />
                Save Conversation
              </Button>
              {Object.keys(savedConversations).length > 0 && (
                <Button variant="outline" onClick={handleDownloadDataset}>
                  <Download className="h-4 w-4 mr-2" />
                  Download Dataset ({Object.keys(savedConversations).length})
                </Button>
              )}
              <Button variant="outline" onClick={() => setIsConfigModalOpen(true)}>
                <Settings2 className="h-4 w-4 mr-2" />
                Configure Shop
              </Button>
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
                      <MessageEditor
                        content={typeof message.content === 'string' ? message.content : ''}
                        isToolCall={isChatCompletionAssistantMessageParam(message) && !!message.tool_calls}
                        toolCall={isChatCompletionAssistantMessageParam(message) && message.tool_calls?.[0]}
                        onSave={(content, isToolCall, toolCall) => 
                          handleSaveEdit(index, content, isToolCall, toolCall)
                        }
                        onCancel={() => setEditingMessageIndex(null)}
                      />
                    ) : (
                      <>
                        {renderContent(message.content)}
                        {message.role === 'tool' && (
                          <div className="mt-1 text-xs text-muted-foreground">
                            Tool Call ID: {message.tool_call_id}
                          </div>
                        )}
                        {isChatCompletionAssistantMessageParam(message) && 
                          message.tool_calls && 
                          renderToolCalls(message.tool_calls, index)}
                      </>
                    )}
                  </div>
                  {!editingMessageIndex && message.role !== 'system' && (
                    <div className="flex justify-end gap-2 mt-1">
                      {(message.role === 'assistant' || message.role === 'tool') && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleSaveUpToIndex(index)}
                          className={savedMessageIndices.has(index) ? "text-green-500" : ""}
                        >
                          <Save className="h-3 w-3" />
                        </Button>
                      )}
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

      <div className="max-w-3xl mx-auto">
        <MessageInput
          value={input}
          onChange={setInput}
          onSubmit={handleSubmit}
          isLoading={isLoading}
          toolCallIds={getToolCallIds()}
          awaitingToolResponse={awaitingToolResponse}
          pendingToolCalls={new Set(pendingToolCalls)}
        />
      </div>

      {pendingToolCalls.length > 0 && !awaitingToolResponse && (
        <p className="text-sm text-destructive mt-2 text-center">
          There are pending tool calls that need to be responded to before continuing the conversation.
        </p>
      )}

      {awaitingToolResponse && (
        <p className="text-sm text-muted-foreground mt-2 text-center">
          Waiting for tool response... Please provide the result of the tool call.
        </p>
      )}

      <ConfigEditorModal
        isOpen={isConfigModalOpen}
        onClose={() => setIsConfigModalOpen(false)}
        onSave={handleConfigSave}
        initialConfig={currentConfig}
      />

      <ToolCallModal
        isOpen={isToolCallModalOpen}
        onClose={() => {
          setIsToolCallModalOpen(false);
          setEditingToolCall(null);
          setEditingIndex(null);
        }}
        onSave={handleToolCallSave}
        initialToolCall={editingToolCall}
      />
    </Card>
  );
}