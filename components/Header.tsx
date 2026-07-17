"use client";

import { useSession } from "next-auth/react";
import { Bell, Moon, Sun } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { signOut } from "next-auth/react";
import { useTheme } from "@/components/ThemeProvider";

interface HeaderProps {
  title: string;
  subtitle?: string;
  breadcrumbs?: { label: string; href?: string }[];
}

export function Header({ title, subtitle, breadcrumbs }: HeaderProps) {
  const { data: session } = useSession();
  const { theme, toggleTheme, mounted } = useTheme();

  const initials = session?.user?.name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <header className="sticky top-0 z-30 border-b-2 border-indigo-100 bg-white/95 px-6 py-5 backdrop-blur-sm dark:border-white/20 dark:bg-black">
      <div className="flex items-center justify-between gap-4">
        <div>
          {breadcrumbs && breadcrumbs.length > 0 && (
            <div className="admin-muted mb-2 flex items-center gap-2 text-sm font-semibold">
              {breadcrumbs.map((crumb, i) => (
                <span key={crumb.label} className="flex items-center gap-2">
                  {i > 0 && <span>/</span>}
                  {crumb.href ? (
                    <Link
                      href={crumb.href}
                      className="text-indigo-600 hover:text-indigo-800 dark:text-white dark:hover:text-white"
                    >
                      {crumb.label}
                    </Link>
                  ) : (
                    <span>{crumb.label}</span>
                  )}
                </span>
              ))}
            </div>
          )}
          <h1 className="text-3xl font-bold tracking-tight text-indigo-800 dark:text-white">
            {title}
          </h1>
          {subtitle && (
            <p className="admin-muted mt-1 text-base">{subtitle}</p>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            className="h-11 w-11 border-2"
            onClick={toggleTheme}
            aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          >
            {mounted && theme === "dark" ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </Button>
          <Button variant="outline" size="icon" className="h-11 w-11 border-2">
            <Bell className="h-5 w-5" />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="relative h-11 w-11 rounded-full border-2 p-0"
              >
                <Avatar className="h-10 w-10">
                  <AvatarImage src={session?.user?.image ?? undefined} />
                  <AvatarFallback className="bg-indigo-100 text-base font-bold text-indigo-700 dark:bg-white dark:text-black">
                    {initials ?? "AD"}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-60 text-base">
              <DropdownMenuLabel>
                <div className="flex flex-col gap-1">
                  <span className="text-base font-bold">{session?.user?.name}</span>
                  <span className="admin-muted text-sm font-normal">
                    {session?.user?.email}
                  </span>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild className="text-base py-2">
                <Link href="/profile">Profile</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="text-base py-2">
                <Link href="/settings">Settings</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-base py-2"
                onClick={() => signOut({ callbackUrl: "/" })}
              >
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
