import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, parseISO, startOfDay, endOfDay, subDays, addDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth, isValid } from "date-fns";
import type { ActivitySortColumn, ActivitySortDirection, ActivityWithRelations } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatActivityDate(date: Date | string) {
  return format(new Date(date), "MMMM d, yyyy");
}

export function formatActivityTime(date: Date | string) {
  return format(new Date(date), "h:mm a");
}

export function sortActivities(
  activities: ActivityWithRelations[],
  column: ActivitySortColumn,
  direction: ActivitySortDirection
): ActivityWithRelations[] {
  const multiplier = direction === "asc" ? 1 : -1;

  return [...activities].sort((a, b) => {
    let comparison = 0;

    switch (column) {
      case "date":
      case "time":
        comparison =
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        break;
      case "activity":
        comparison = a.activity.localeCompare(b.activity, undefined, {
          sensitivity: "base",
        });
        break;
      case "status":
        comparison = a.status.name.localeCompare(b.status.name, undefined, {
          sensitivity: "base",
        });
        break;
      case "remarks":
        comparison = a.remarks.localeCompare(b.remarks, undefined, {
          sensitivity: "base",
        });
        break;
    }

    return comparison * multiplier;
  });
}

export function getNextSortDirection(
  column: ActivitySortColumn,
  currentColumn: ActivitySortColumn,
  currentDirection: ActivitySortDirection
): ActivitySortDirection {
  if (column === currentColumn) {
    return currentDirection === "asc" ? "desc" : "asc";
  }

  return column === "date" || column === "time" ? "desc" : "asc";
}

export function sanitizeText(value: string, maxLength = 5000) {
  return value.trim().slice(0, maxLength);
}

export function getDefaultStatusColor(name: string) {
  const colors: Record<string, string> = {
    Completed: "#22c55e",
    Pending: "#eab308",
    Ongoing: "#3b82f6",
    Cancelled: "#ef4444",
    "Need Revision": "#f97316",
    "Waiting Approval": "#a855f7",
  };
  return colors[name] ?? "#6b7280";
}

export function getStatusBadgeClasses() {
  return cn(
    "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium border",
    "bg-opacity-10 border-opacity-30"
  );
}

export function getStartOfDay(date = new Date()) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function getEndOfDay(date = new Date()) {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
}

export function toDateInputValue(date: Date) {
  return format(date, "yyyy-MM-dd");
}

export function toTimeInputValue(date: Date | string) {
  return format(new Date(date), "HH:mm");
}

export function normalizeActivityTime(time: string): string {
  const match = time.trim().match(/^(\d{1,2}):(\d{2})/);
  if (!match) {
    throw new Error("Invalid time");
  }

  const hours = Number(match[1]);
  const minutes = Number(match[2]);

  if (
    Number.isNaN(hours) ||
    Number.isNaN(minutes) ||
    hours < 0 ||
    hours > 23 ||
    minutes < 0 ||
    minutes > 59
  ) {
    throw new Error("Invalid time");
  }

  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

export function parseActivityDateTime(date: string, time: string): Date {
  const [year, month, day] = date.split("-").map(Number);
  if (!year || !month || !day) {
    throw new Error("Invalid date");
  }

  const parsedDate = new Date(year, month - 1, day);
  if (!isValid(parsedDate) || toDateInputValue(parsedDate) !== date) {
    throw new Error("Invalid date");
  }

  const { hours, minutes } = (() => {
    const normalized = normalizeActivityTime(time);
    const [h, m] = normalized.split(":").map(Number);
    return { hours: h, minutes: m };
  })();

  return new Date(year, month - 1, day, hours, minutes, 0, 0);
}

export function formatGuestPeriodLabel(lookup: {
  preset: string;
  startDate?: string;
  endDate?: string;
}) {
  const now = new Date();

  switch (lookup.preset) {
    case "today":
      return format(now, "EEEE, MMMM d, yyyy");
    case "yesterday":
      return format(subDays(now, 1), "EEEE, MMMM d, yyyy");
    case "week":
      return `${format(startOfWeek(now), "MMM d")} – ${format(endOfWeek(now), "MMM d, yyyy")}`;
    case "month":
      return format(now, "MMMM yyyy");
    case "all":
      return "All Activities";
    case "custom": {
      const start = lookup.startDate ? parseISO(lookup.startDate) : null;
      const end = lookup.endDate ? parseISO(lookup.endDate) : null;

      if (start && isValid(start) && end && isValid(end)) {
        if (lookup.startDate === lookup.endDate) {
          return format(start, "EEEE, MMMM d, yyyy");
        }
        return `${format(start, "MMM d, yyyy")} – ${format(end, "MMM d, yyyy")}`;
      }
      if (start && isValid(start)) {
        return format(start, "EEEE, MMMM d, yyyy");
      }
      if (end && isValid(end)) {
        return format(end, "EEEE, MMMM d, yyyy");
      }
      return format(now, "EEEE, MMMM d, yyyy");
    }
    default:
      return format(now, "EEEE, MMMM d, yyyy");
  }
}

export function getGuestActivityCountLabel(preset: string) {
  switch (preset) {
    case "today":
      return "activities today";
    case "yesterday":
      return "activities yesterday";
    case "week":
      return "activities this week";
    case "month":
      return "activities this month";
    case "all":
      return "total activities";
    default:
      return "activities shown";
  }
}
