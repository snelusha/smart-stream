"use client";

import * as React from "react";

import { Bolt, LoaderCircle } from "lucide-react";

import { Button } from "@/components/ui/button";

import { useConfigStore } from "@/stores/config";

export default function Page() {
  const configStore = useConfigStore();

  return (
    <main className="relative grid min-h-[var(--main-content-height)] px-6">
      <div className="mt-10 flex w-full flex-col items-center">
        <div className="grid aspect-video w-full max-w-3xl place-items-center rounded-xl bg-muted">
          <div className="flex flex-col items-center">
            {configStore.hasHydrated && !configStore.config.address ? (
              <>
                <Bolt className="size-5 text-muted-foreground" />
                <h1 className="mt-2 text-muted-foreground">
                  Waiting for configuration!
                </h1>
              </>
            ) : (
              <>
                <LoaderCircle className="size-5 animate-spin text-muted-foreground" />
                <h1 className="mt-2 text-muted-foreground">
                  Waiting for image!
                </h1>
              </>
            )}
          </div>
        </div>
      </div>
      <footer className="absolute inset-x-0 bottom-4 flex flex-col items-center">
        <p className="text-muted-foreground">
          Made by a&nbsp;
          <span className="font-medium text-secondary-foreground">human</span>
          &nbsp; in earth!
        </p>
      </footer>
    </main>
  );
}
