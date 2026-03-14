"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function Breadcrumbs() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  return (
    <nav className="text-sm text-slate-400">
      <ol className="flex flex-wrap items-center gap-2">
        <li>
          <Link href="/dashboard">Dashboard</Link>
        </li>
        {segments.slice(1).map((segment, index) => {
          const href = `/${segments.slice(0, index + 2).join("/")}`;

          return (
            <li key={href} className="flex items-center gap-2">
              <span>/</span>
              <Link href={href} className="capitalize text-slate-300">
                {segment.replaceAll("-", " ")}
              </Link>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

