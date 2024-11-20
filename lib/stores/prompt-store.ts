"use client";

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { DEFAULT_PROMPT } from '@/lib/evaluation';

const DEFAULT_COMPARISON_PROMPT = `Compare the following two messages and rate their similarity on a scale from 1 to 100 based on content, tone, and brevity.
ONLY INCLUDE THE NUMBER IN YOUR RESPONSE.

### Generated Message:
{{generated_message}}

### Ideal Message:
{{ideal_message}}

### Rating (1-100):`;

interface PromptStore {
  systemPrompt: string;
  comparisonPrompt: string;
  setSystemPrompt: (prompt: string) => void;
  setComparisonPrompt: (prompt: string) => void;
  resetPrompts: () => void;
}

export const usePromptStore = create<PromptStore>()(
  persist(
    (set) => ({
      systemPrompt: DEFAULT_PROMPT,
      comparisonPrompt: DEFAULT_COMPARISON_PROMPT,
      setSystemPrompt: (prompt) => set({ systemPrompt: prompt }),
      setComparisonPrompt: (prompt) => set({ comparisonPrompt: prompt }),
      resetPrompts: () => set({
        systemPrompt: DEFAULT_PROMPT,
        comparisonPrompt: DEFAULT_COMPARISON_PROMPT,
      }),
    }),
    {
      name: 'prompt-storage',
    }
  )
);