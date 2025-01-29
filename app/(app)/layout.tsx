import * as React from "react";

import NavigationBar from "@/components/navigation-bar";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col">
      <NavigationBar />
      <div className="relative flex grow flex-col">{children}</div>
    </div>
  );
}
