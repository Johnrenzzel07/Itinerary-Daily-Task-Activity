import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, parseISO, startOfDay, endOfDay, subDays, addDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth, isValid } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatActivityDate(date: Date | string) {
  return format(new Date(date), "MMMM d, yyyy");
}

export function formatActivityTime(date: Date | string) {
  return format(new Date(date), "h:mm a");
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

export function toTimeInputValue(date: Date) {
  return format(date, "HH:mm");
}

export function parseActivityDateTime(date: string, time: string): Date {
  const parsedDate = parseISO(date);
  if (!isValid(parsedDate)) {
    throw new Error("Invalid date");
  }

  const [hours, minutes] = time.split(":").map(Number);
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

  const result = new Date(parsedDate);
  result.setHours(hours, minutes, 0, 0);
  return result;
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
