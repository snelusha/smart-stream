"use client";

import { useConfigStore } from "@/stores/config";

export default function Page() {
  const configStore = useConfigStore();

  return (
    <main className="grid min-h-dvh place-items-center">
      <p className="text-muted-foreground">
        Made by a <span className="text-secondary-foreground font-medium">human</span> in
        earth!
      </p>
    </main>
  );
}
