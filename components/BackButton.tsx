"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeft } from "lucide-react";

export function BackButton() {
  const pathname = usePathname();
  if (pathname === "/") return null;

  const pageNames: Record<string, string> = {
    "/intelligence": "Intelligence Platform",
    "/executive": "Executive Dashboard",
    "/storytelling": "Research Storytelling",
  };

  return (
    <div className="bg-white border-b border-border sticky top-0 z-40">
      <div className="container mx-auto px-6 h-12 flex items-center justify-between">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground font-medium transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Research Portal
        </Link>
        <div className="flex items-center gap-3">
          <span className="text-xs text-muted-foreground">{pageNames[pathname] ?? ""}</span>
          <img src="/logo.svg" alt="Ashoka University" className="h-7 w-auto" />
        </div>
      </div>
    </div>
  );
}

