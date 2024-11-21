"use client";

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const AVAILABLE_MODELS = [
  { id: 'gpt-4o-mini', name: 'GPT-4o-mini'},
  { id: 'gpt-4o', name: 'GPT-4o'},
] as const;

interface ModelStore {
  chatModel: string;
  evaluationModel: string;
  setChatModel: (model: string) => void;
  setEvaluationModel: (model: string) => void;
}

export const useModelStore = create<ModelStore>()(
  persist(
    (set) => ({
      chatModel: 'gpt-4o-mini',
      evaluationModel: 'gpt-4o-mini',
      setChatModel: (model) => set({ chatModel: model }),
      setEvaluationModel: (model) => set({ evaluationModel: model }),
    }),
    {
      name: 'model-storage',
    }
  )
);