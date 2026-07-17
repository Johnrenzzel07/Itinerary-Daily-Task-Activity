"use client";

import { motion } from "framer-motion";
import {
  Calendar,
  CheckCircle2,
  Clock,
  ListTodo,
  type LucideIcon,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useCountUp } from "@/hooks/useCountUp";
import { STATS_ACCENT } from "@/lib/admin-theme";
import type { StatsIconName } from "@/lib/admin-theme";
import { cn } from "@/lib/utils";

const iconMap = {
  "list-todo": ListTodo,
  completed: CheckCircle2,
  pending: Clock,
  ongoing: Calendar,
} as const satisfies Record<StatsIconName, LucideIcon>;

export type { StatsIconName };

interface StatsCardProps {
  title: string;
  value: number;
  icon: StatsIconName;
  suffix?: string;
  trend?: string;
  className?: string;
}

export function StatsCard({
  title,
  value,
  icon,
  suffix = "",
  trend,
  className,
}: StatsCardProps) {
  const count = useCountUp(value);
  const Icon = iconMap[icon];
  const accent = STATS_ACCENT[icon];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Card className={cn("overflow-hidden border-2", accent.ring, accent.bg, className)}>
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-base font-medium text-slate-600 dark:text-white/60">{title}</p>
              <p className="mt-2 text-4xl font-bold tracking-tight text-slate-900 dark:text-white">
                {count}
                {suffix}
              </p>
              {trend && (
                <p className="admin-muted mt-1 text-sm">{trend}</p>
              )}
            </div>
            <div className={cn("rounded-xl p-3 shadow-sm", accent.icon)}>
              <Icon className="h-5 w-5" />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
