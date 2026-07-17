"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Command } from "cmdk";
import { Search, LayoutDashboard, ListTodo, Tags, Settings, User, Plus } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const navigate = (href: string) => {
    setOpen(false);
    router.push(href);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="overflow-hidden p-0 shadow-2xl">
        <Command className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-black/60 dark:[&_[cmdk-group-heading]]:text-white/60">
          <div className="flex items-center border-b px-3">
            <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
            <Command.Input
              placeholder="Search commands..."
              className="flex h-12 w-full rounded-md bg-transparent py-3 text-sm outline-none"
            />
          </div>
          <Command.List className="max-h-[300px] overflow-y-auto p-2">
            <Command.Empty>No results found.</Command.Empty>
            <Command.Group heading="Navigation">
              <Command.Item
                onSelect={() => navigate("/dashboard")}
                className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-2 text-sm aria-selected:bg-black/5 dark:aria-selected:bg-white/5"
              >
                <LayoutDashboard className="h-4 w-4" /> Dashboard
              </Command.Item>
              <Command.Item
                onSelect={() => navigate("/activities")}
                className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-2 text-sm aria-selected:bg-black/5 dark:aria-selected:bg-white/5"
              >
                <ListTodo className="h-4 w-4" /> Activities
              </Command.Item>
              <Command.Item
                onSelect={() => navigate("/status")}
                className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-2 text-sm aria-selected:bg-black/5 dark:aria-selected:bg-white/5"
              >
                <Tags className="h-4 w-4" /> Status Manager
              </Command.Item>
              <Command.Item
                onSelect={() => navigate("/profile")}
                className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-2 text-sm aria-selected:bg-black/5 dark:aria-selected:bg-white/5"
              >
                <User className="h-4 w-4" /> Profile
              </Command.Item>
              <Command.Item
                onSelect={() => navigate("/settings")}
                className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-2 text-sm aria-selected:bg-black/5 dark:aria-selected:bg-white/5"
              >
                <Settings className="h-4 w-4" /> Settings
              </Command.Item>
            </Command.Group>
            <Command.Group heading="Actions">
              <Command.Item
                onSelect={() => navigate("/activities?create=true")}
                className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-2 text-sm aria-selected:bg-black/5 dark:aria-selected:bg-white/5"
              >
                <Plus className="h-4 w-4" /> Create Activity
              </Command.Item>
            </Command.Group>
          </Command.List>
        </Command>
      </DialogContent>
    </Dialog>
  );
}
