import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { TOOLS as DEFAULT_TOOLS } from './evaluation';

interface ToolParameter {
    type: string;
    description?: string;
  }
  
  export interface Tool {
    type: 'function';
    function: {
      name: string;
      description: string;
      parameters: {
        type: 'object';
        properties: {
          [key: string]: ToolParameter;
        };
        required: string[];
        additionalProperties: boolean;
      };
    };
  }

interface Settings {
  apiKey: string;
  tools: Tool[];
  setApiKey: (key: string) => void;
  setTools: (tools: Tool[]) => void;
  resetTools: () => void;
}

export const useSettings = create<Settings>()(
  persist(
    (set) => ({
      apiKey: process.env.OPENAI_API_KEY || '',
      tools: DEFAULT_TOOLS,
      setApiKey: (key) => set({ apiKey: key }),
      setTools: (tools) => set({ tools }),
      resetTools: () => set({ tools: DEFAULT_TOOLS }),
    }),
    {
      name: 'settings-storage',
    }
  )
);