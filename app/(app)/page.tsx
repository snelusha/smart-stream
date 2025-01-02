"use client";

import * as React from "react";

export default function Page() {
  return (
    <main className="relative grid min-h-[var(--main-content-height)] place-items-center">
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
