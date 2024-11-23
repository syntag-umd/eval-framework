"use client";

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface TimezoneStore {
  timezone: string;
  setTimezone: (timezone: string) => void;
}

export const useTimezoneStore = create<TimezoneStore>()(
  persist(
    (set) => ({
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      setTimezone: (timezone) => set({ timezone }),
    }),
    {
      name: 'timezone-storage',
    }
  )
);