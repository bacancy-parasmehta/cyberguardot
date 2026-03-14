import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Toaster } from "sonner";

import "./globals.css";

export const metadata: Metadata = {
  title: "CyberGuard OT",
  description: "Operational Technology Security Platform",
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
