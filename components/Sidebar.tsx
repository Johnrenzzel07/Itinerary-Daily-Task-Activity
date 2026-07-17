"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  ListTodo,
  Tags,
  Settings,
  User,
  LogOut,
  ClipboardList,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { signOut } from "next-auth/react";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, accent: "hover:bg-indigo-500/20" },
  { href: "/activities", label: "Activities", icon: ListTodo, accent: "hover:bg-sky-500/20" },
  { href: "/status", label: "Status Manager", icon: Tags, accent: "hover:bg-violet-500/20" },
  { href: "/profile", label: "Profile", icon: User, accent: "hover:bg-emerald-500/20" },
  { href: "/settings", label: "Settings", icon: Settings, accent: "hover:bg-amber-500/20" },
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 flex h-screen flex-col border-r border-indigo-500/20 bg-gradient-to-b from-indigo-700 via-indigo-800 to-violet-900 text-white shadow-xl transition-all duration-300 dark:border-white/20 dark:bg-black dark:bg-none dark:from-black dark:via-black dark:to-black",
        collapsed ? "w-[80px]" : "w-72"
      )}
    >
      <div className="flex h-20 items-center gap-3 px-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/15 text-white ring-2 ring-white/25 dark:bg-white dark:text-black dark:ring-white/20">
          <ClipboardList className="h-6 w-6" />
        </div>
        {!collapsed && (
          <div>
            <p className="text-base font-bold text-white">Itinerary</p>
            <p className="text-sm font-medium text-indigo-100 dark:text-white/70">Admin Console</p>
          </div>
        )}
      </div>

      <Separator className="bg-white/15 dark:bg-white/20" />

      <nav className="flex-1 space-y-1 p-3">
        {navItems.map((item) => {
          const active = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link key={item.href} href={item.href}>
              <motion.div
                whileHover={{ x: 2 }}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-4 py-3 text-base font-semibold transition-colors",
                  active
                    ? "bg-white text-indigo-800 shadow-md dark:bg-white dark:text-black"
                    : cn("text-indigo-50 dark:text-white", item.accent, "dark:hover:bg-white/10")
                )}
              >
                <Icon className="h-5 w-5 shrink-0" />
                {!collapsed && <span>{item.label}</span>}
              </motion.div>
            </Link>
          );
        })}
      </nav>

      <div className="space-y-2 p-3">
        <Button
          variant="outline"
          className={cn(
            "h-11 w-full border-2 border-white/30 bg-white/10 text-base font-semibold text-white hover:bg-white hover:text-indigo-800 dark:border-white dark:bg-black dark:text-white dark:hover:bg-white dark:hover:text-black",
            collapsed && "px-0"
          )}
          onClick={() => signOut({ callbackUrl: "/" })}
        >
          <LogOut className="h-5 w-5" />
          {!collapsed && <span>Logout</span>}
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="h-11 w-full border-2 border-white/30 bg-white/10 text-white hover:bg-white hover:text-indigo-800 dark:border-white dark:bg-black dark:text-white dark:hover:bg-white dark:hover:text-black"
          onClick={onToggle}
        >
          {collapsed ? (
            <ChevronRight className="h-5 w-5" />
          ) : (
            <ChevronLeft className="h-5 w-5" />
          )}
        </Button>
      </div>
    </aside>
  );
}
