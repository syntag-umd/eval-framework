"use client";

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Completions } from 'openai/resources/chat/completions';

interface CurrentConversationStore {
  messages: Completions.ChatCompletionMessageParam[];
  currentConfig: Record<string, any>;
  pendingToolCalls: string[];
  awaitingToolResponse: string | null;
  firstMessage: string;
  setMessages: (messages: Completions.ChatCompletionMessageParam[]) => void;
  addMessage: (message: Completions.ChatCompletionMessageParam) => void;
  updateMessage: (index: number, message: Completions.ChatCompletionMessageParam) => void;
  deleteMessage: (index: number) => void;
  setCurrentConfig: (config: Record<string, any>) => void;
  setPendingToolCalls: (calls: string[]) => void;
  setAwaitingToolResponse: (toolId: string | null) => void;
  setFirstMessage: (message: string) => void;
  clearConversation: () => void;
}

const DEFAULT_CONFIG: Record<string, any> = {
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
    "Beard Styling": ["Mike"],
    Coloring: ["Sarah"],
    Styling: ["Sarah"]
  },
  hardcoded_datetime: new Date().toISOString()
};

const DEFAULT_FIRST_MESSAGE = "This is Cali's Finest Barberlounge, how can I help you?";

export const useCurrentConversationStore = create<CurrentConversationStore>()(
  persist(
    (set) => ({
      messages: [],
      currentConfig: DEFAULT_CONFIG,
      pendingToolCalls: [],
      awaitingToolResponse: null,
      firstMessage: DEFAULT_FIRST_MESSAGE,
      setMessages: (messages) => set({ messages }),
      addMessage: (message) => set((state) => ({ 
        messages: [...state.messages, message] 
      })),
      updateMessage: (index, message) => set((state) => ({
        messages: state.messages.map((msg, i) => i === index ? message : msg)
      })),
      deleteMessage: (index) => set((state) => ({
        messages: state.messages.filter((_, i) => i !== index)
      })),
      setCurrentConfig: (config) => set({ currentConfig: config }),
      setPendingToolCalls: (calls) => set({ pendingToolCalls: calls }),
      setAwaitingToolResponse: (toolId) => set({ awaitingToolResponse: toolId }),
      setFirstMessage: (message) => set({ firstMessage: message }),
      clearConversation: () => set({
        messages: [],
        pendingToolCalls: [],
        awaitingToolResponse: null
      })
    }),
    {
      name: 'current-conversation-storage',
    }
  )
);