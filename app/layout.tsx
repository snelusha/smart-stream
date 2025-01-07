import "@/styles/globals.css";

import { Toaster } from "@/components/ui/sonner";

import { geistSans, geistMono } from "@/styles/fonts";

import { cn } from "@/styles/utils";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "stream",
  description: "a simple webrtc client",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn(geistSans.variable, geistMono.variable)}>
        {children}
        <Toaster className="z-40" />
      </body>
    </html>
  );
}
