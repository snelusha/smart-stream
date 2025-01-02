import * as React from "react";

import NavigationBar from "@/components/navigation-bar";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <NavigationBar />
      <div className="relative grow">{children}</div>
    </>
  );
}
