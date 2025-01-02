"use client";

import { Button } from "@/components/ui/button";
import { LoaderCircleIcon, PlayIcon } from "lucide-react";
import * as React from "react";

export default function Page() {
  return (
    <main className="relative grid min-h-[var(--main-content-height)] px-6">
      <div className="mt-10 flex w-full flex-col items-center">
        <div className="grid aspect-video w-full max-w-3xl place-items-center rounded-xl bg-muted">
          <div className="flex flex-col items-center">
            <LoaderCircleIcon className="size-5 animate-spin text-muted-foreground" />
            <h1 className="text-base text-muted-foreground mt-4">
              Waiting for image!
            </h1>
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
