import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface Config {
  address: string | null;
  stun: boolean;
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
        address: null,
        stun: false,
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
