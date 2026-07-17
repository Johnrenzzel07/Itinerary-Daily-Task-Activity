export const ADMIN_CHART_COLORS = [
  "#4F46E5",
  "#22C55E",
  "#F59E0B",
  "#EF4444",
  "#8B5CF6",
  "#06B6D4",
  "#EC4899",
  "#F97316",
] as const;

export const ADMIN_DARK_CHART_COLORS = ["#FFFFFF", "#888888", "#CCCCCC", "#666666"] as const;

export type StatsIconName = "list-todo" | "completed" | "pending" | "ongoing";

export const STATS_ACCENT: Record<
  StatsIconName,
  { bg: string; icon: string; ring: string }
> = {
  "list-todo": {
    bg: "bg-indigo-50 dark:bg-black",
    icon: "bg-indigo-600 text-white dark:bg-white dark:text-black",
    ring: "border-indigo-100 dark:border-white/20",
  },
  completed: {
    bg: "bg-emerald-50 dark:bg-black",
    icon: "bg-emerald-600 text-white dark:bg-white dark:text-black",
    ring: "border-emerald-100 dark:border-white/20",
  },
  pending: {
    bg: "bg-amber-50 dark:bg-black",
    icon: "bg-amber-500 text-white dark:bg-white dark:text-black",
    ring: "border-amber-100 dark:border-white/20",
  },
  ongoing: {
    bg: "bg-sky-50 dark:bg-black",
    icon: "bg-sky-600 text-white dark:bg-white dark:text-black",
    ring: "border-sky-100 dark:border-white/20",
  },
};
