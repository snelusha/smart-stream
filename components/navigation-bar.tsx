import * as React from "react";

import Link from "next/link";

import { ConfigureButton } from "@/components/configure-button";

export default function NavigationBar() {
  return (
    <header className="sticky top-0 z-30 [transform:_translate3d(0,0,999px)]">
      <div className="relative z-30 backdrop-blur-md">
        <div className="container relative mx-auto flex h-[var(--navigation-bar-height)] max-w-(--breakpoint-2xl) items-center justify-between">
          <div className="flex items-center gap-4">
            <Link className="focus-visible:outline-hidden" href="/">
              <h1 className="text-xl font-medium tracking-tight">stream</h1>
            </Link>
          </div>
          <ConfigureButton />
        </div>
      </div>
    </header>
  );
}
