import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export interface Config {
  address: string | undefined;
  stun: string | undefined;
  turn: {
    url: string | undefined;
    username: string | undefined;
    password: string | undefined;
  };
}

interface ConfigState {
  config: Config;
  setConfig: (config: Partial<Config>) => void;
  hasHydrated: boolean;
}

export const useConfigStore = create<ConfigState>()(
  persist(
    (set, get) => ({
      config: {
        address: undefined,
        stun: undefined,
        turn: {
          url: undefined,
          username: undefined,
          password: undefined,
        },
      },
      setConfig: (config) =>
        set({
          config: {
            ...get().config,
            ...config,
          },
        }),
      hasHydrated: false,
    }),
    {
      name: "config-storage",
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        if (!state) return;
        state.hasHydrated = true;
      },
    },
  ),
);
