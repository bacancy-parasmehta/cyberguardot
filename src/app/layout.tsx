import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Toaster } from "sonner";

import { appMeta } from "@/lib/constants";

import "./globals.css";

export const metadata: Metadata = {
  title: appMeta.name,
  description: appMeta.subtitle,
  applicationName: appMeta.name,
  icons: {
    icon: "/icon.svg",
    shortcut: "/icon.svg",
    apple: "/icon.svg",
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html className="dark" lang="en">
      <body className="bg-slate-950 text-white antialiased">
        {children}
        <Toaster richColors position="top-right" theme="dark" />
      </body>
    </html>
  );
}
