"use client";

import { Badge } from "@/components/ui/badge";
import { getDefaultStatusColor } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  name: string;
  color?: string;
  className?: string;
  variant?: "default" | "guest";
}

const filledStatuses = new Set(["completed", "cancelled"]);

export function StatusBadge({ name, color, className, variant = "default" }: StatusBadgeProps) {
  const isFilled = filledStatuses.has(name.toLowerCase());
  const isGuest = variant === "guest";
  const statusColor = color ?? getDefaultStatusColor(name);

  return (
    <Badge
      style={{ "--status-color": statusColor } as React.CSSProperties}
      className={cn(
        "border px-3 py-1 text-sm font-semibold",
        isGuest
          ? cn(
              "guest-status-light border-2 dark:!border-white dark:!bg-black dark:!text-white",
              isFilled &&
                "guest-status-filled-light dark:!border-white dark:!bg-white dark:!text-black"
            )
          : cn(
              "admin-status-light dark:!border-white dark:!bg-black dark:!text-white",
              isFilled &&
                "admin-status-filled-light dark:!border-white dark:!bg-white dark:!text-black"
            ),
        className
      )}
    >
      {name}
    </Badge>
  );
}
