"use client";

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Completions } from 'openai/resources/chat/completions';
import { ShopConfig } from '@/lib/types';

interface CurrentConversationStore {
  messages: Completions.ChatCompletionMessageParam[];
  currentConfig: ShopConfig;
  pendingToolCalls: string[];
  awaitingToolResponse: string | null;
  setMessages: (messages: Completions.ChatCompletionMessageParam[]) => void;
  addMessage: (message: Completions.ChatCompletionMessageParam) => void;
  updateMessage: (index: number, message: Completions.ChatCompletionMessageParam) => void;
  deleteMessage: (index: number) => void;
  setCurrentConfig: (config: ShopConfig) => void;
  setPendingToolCalls: (calls: string[]) => void;
  setAwaitingToolResponse: (toolId: string | null) => void;
  clearConversation: () => void;
}

const DEFAULT_CONFIG: ShopConfig = {
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

export const useCurrentConversationStore = create<CurrentConversationStore>()(
  persist(
    (set) => ({
      messages: [],
      currentConfig: DEFAULT_CONFIG,
      pendingToolCalls: [],
      awaitingToolResponse: null,
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