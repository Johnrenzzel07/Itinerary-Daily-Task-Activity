import {
  endOfDay,
  endOfMonth,
  endOfWeek,
  format,
  isValid,
  parseISO,
  startOfDay,
  startOfMonth,
  startOfWeek,
  subDays,
} from "date-fns";
import { formatInTimeZone, fromZonedTime, toZonedTime } from "date-fns-tz";

export const PHILIPPINES_TIMEZONE = "Asia/Manila";

export function getPhilippinesNowDateTime() {
  const now = new Date();

  return {
    date: formatInTimeZone(now, PHILIPPINES_TIMEZONE, "yyyy-MM-dd"),
    time: formatInTimeZone(now, PHILIPPINES_TIMEZONE, "HH:mm"),
  };
}

export function formatPhilippinesDate(instant: Date | string) {
  return formatInTimeZone(new Date(instant), PHILIPPINES_TIMEZONE, "MMMM d, yyyy");
}

export function formatPhilippinesTime(instant: Date | string) {
  return formatInTimeZone(new Date(instant), PHILIPPINES_TIMEZONE, "h:mm a");
}

export function toPhilippinesDateInputValue(instant: Date | string) {
  return formatInTimeZone(new Date(instant), PHILIPPINES_TIMEZONE, "yyyy-MM-dd");
}

export function toPhilippinesTimeInputValue(instant: Date | string) {
  return formatInTimeZone(new Date(instant), PHILIPPINES_TIMEZONE, "HH:mm");
}

export function parsePhilippinesDateTime(date: string, time: string) {
  const normalizedTime = time.trim().match(/^(\d{1,2}):(\d{2})/);
  if (!normalizedTime) {
    throw new Error("Invalid time");
  }

  const hours = Number(normalizedTime[1]);
  const minutes = Number(normalizedTime[2]);

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

  const normalized = `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
  const instant = fromZonedTime(`${date}T${normalized}:00`, PHILIPPINES_TIMEZONE);

  if (!isValid(instant)) {
    throw new Error("Invalid date");
  }

  if (toPhilippinesDateInputValue(instant) !== date) {
    throw new Error("Invalid date");
  }

  return instant;
}

function toPhilippinesZoned(instant: Date | string = new Date()) {
  return toZonedTime(new Date(instant), PHILIPPINES_TIMEZONE);
}

function zonedRange(start: Date, end: Date) {
  return {
    gte: fromZonedTime(start, PHILIPPINES_TIMEZONE),
    lte: fromZonedTime(end, PHILIPPINES_TIMEZONE),
  };
}

export function getPhilippinesDayRange(instant: Date | string = new Date()) {
  const zoned = toPhilippinesZoned(instant);
  return zonedRange(startOfDay(zoned), endOfDay(zoned));
}

export function getPhilippinesYesterdayRange() {
  const zoned = toPhilippinesZoned(new Date());
  const yesterday = subDays(zoned, 1);
  return zonedRange(startOfDay(yesterday), endOfDay(yesterday));
}

export function getPhilippinesWeekRange() {
  const zoned = toPhilippinesZoned(new Date());
  return zonedRange(startOfWeek(zoned), endOfWeek(zoned));
}

export function getPhilippinesMonthRange() {
  const zoned = toPhilippinesZoned(new Date());
  return zonedRange(startOfMonth(zoned), endOfMonth(zoned));
}

export function getPhilippinesCustomRange(startDate?: string, endDate?: string) {
  const start = startDate && isValid(parseISO(startDate)) ? parseISO(startDate) : null;
  const end = endDate && isValid(parseISO(endDate)) ? parseISO(endDate) : null;

  if (start && end) {
    const startZoned = startOfDay(toZonedTime(start, PHILIPPINES_TIMEZONE));
    const endZoned = endOfDay(toZonedTime(end, PHILIPPINES_TIMEZONE));
    return zonedRange(startZoned, endZoned);
  }

  if (start) {
    const startZoned = startOfDay(toZonedTime(start, PHILIPPINES_TIMEZONE));
    return zonedRange(startZoned, endOfDay(startZoned));
  }

  if (end) {
    const endZoned = endOfDay(toZonedTime(end, PHILIPPINES_TIMEZONE));
    return zonedRange(startOfDay(endZoned), endZoned);
  }

  return undefined;
}

export function formatPhilippinesLabel(instant: Date | string, pattern: string) {
  return formatInTimeZone(new Date(instant), PHILIPPINES_TIMEZONE, pattern);
}

export function formatPhilippinesNowLabel(pattern: string) {
  return formatPhilippinesLabel(new Date(), pattern);
}

export function formatPhilippinesGuestPeriodLabel(lookup: {
  preset: string;
  startDate?: string;
  endDate?: string;
}) {
  switch (lookup.preset) {
    case "today":
      return formatPhilippinesNowLabel("EEEE, MMMM d, yyyy");
    case "yesterday": {
      const zoned = toPhilippinesZoned(new Date());
      const yesterday = subDays(zoned, 1);
      return format(yesterday, "EEEE, MMMM d, yyyy");
    }
    case "week": {
      const zoned = toPhilippinesZoned(new Date());
      return `${format(startOfWeek(zoned), "MMM d")} – ${format(endOfWeek(zoned), "MMM d, yyyy")}`;
    }
    case "month":
      return formatPhilippinesNowLabel("MMMM yyyy");
    case "all":
      return "All Activities";
    case "custom": {
      const start = lookup.startDate ? parseISO(lookup.startDate) : null;
      const end = lookup.endDate ? parseISO(lookup.endDate) : null;

      if (start && isValid(start) && end && isValid(end)) {
        if (lookup.startDate === lookup.endDate) {
          return formatPhilippinesLabel(start, "EEEE, MMMM d, yyyy");
        }
        return `${formatPhilippinesLabel(start, "MMM d, yyyy")} – ${formatPhilippinesLabel(end, "MMM d, yyyy")}`;
      }
      if (start && isValid(start)) {
        return formatPhilippinesLabel(start, "EEEE, MMMM d, yyyy");
      }
      if (end && isValid(end)) {
        return formatPhilippinesLabel(end, "EEEE, MMMM d, yyyy");
      }
      return formatPhilippinesNowLabel("EEEE, MMMM d, yyyy");
    }
    default:
      return formatPhilippinesNowLabel("EEEE, MMMM d, yyyy");
  }
}
