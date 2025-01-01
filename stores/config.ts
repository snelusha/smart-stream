import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface Config {
  endpoint: string;
}

interface ConfigState {
  config: Config;
  setConfig: (config: Config) => void;
}

export const useConfigStore = create<ConfigState>()(
  persist(
    (set, get) => ({
      config: {
        endpoint: "",
      },
      setConfig: (config) =>
        set({
          config: {
            ...get().config,
            ...config,
          },
        }),
    }),
    {
      name: "config-storage",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
