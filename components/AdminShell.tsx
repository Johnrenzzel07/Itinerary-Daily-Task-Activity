"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Sidebar } from "@/components/Sidebar";
import { CommandPalette } from "@/components/CommandPalette";

export function AdminShell({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="admin-shell min-h-screen bg-[var(--admin-surface)] text-slate-900 dark:bg-black dark:text-white">
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((c) => !c)} />
      <main
        className={cn(
          "admin-shell min-h-screen bg-[var(--admin-surface)] text-base leading-relaxed transition-all duration-300 dark:bg-black dark:text-white",
          collapsed ? "ml-[80px]" : "ml-72"
        )}
      >
        {children}
      </main>
      <CommandPalette />
    </div>
  );
}
