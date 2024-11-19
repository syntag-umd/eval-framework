import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Completions } from 'openai/resources/chat/completions';
import { ShopConfig } from '@/lib/types';

export interface SavedConversation {
  input: Completions.ChatCompletionMessageParam[];
  output: {
    message: string;
    tool_calls: any[];
  };
  config: ShopConfig;
}

interface ConversationStore {
  savedConversations: { [key: string]: SavedConversation };
  addConversation: (id: string, conversation: SavedConversation) => void;
  clearConversations: () => void;
}

export const useConversationStore = create<ConversationStore>()(
  persist(
    (set) => ({
      savedConversations: {},
      addConversation: (id, conversation) =>
        set((state) => ({
          savedConversations: {
            ...state.savedConversations,
            [id]: conversation,
          },
        })),
      clearConversations: () => set({ savedConversations: {} }),
    }),
    {
      name: 'conversation-storage',
    }
  )
);