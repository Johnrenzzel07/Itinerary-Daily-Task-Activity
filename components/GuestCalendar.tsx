"use client";

import * as React from "react";
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  parseISO,
  startOfMonth,
  startOfWeek,
  subMonths,
} from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface GuestCalendarProps {
  selected?: string;
  onSelect: (isoDate: string) => void;
  className?: string;
}

const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

export function GuestCalendar({ selected, onSelect, className }: GuestCalendarProps) {
  const selectedDate = selected ? parseISO(selected) : undefined;
  const [viewMonth, setViewMonth] = React.useState(selectedDate ?? new Date());

  const monthStart = startOfMonth(viewMonth);
  const monthEnd = endOfMonth(viewMonth);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);
  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const navBtn =
    "inline-flex h-10 w-10 items-center justify-center rounded-lg border-2 border-indigo-200 bg-white text-indigo-800 hover:border-indigo-600 hover:bg-indigo-600 hover:text-white dark:border-white dark:bg-black dark:text-white dark:hover:bg-white dark:hover:text-black";

  return (
    <div className={cn("w-[320px] select-none", className)}>
      <div className="mb-4 flex items-center justify-between">
        <button type="button" aria-label="Previous month" onClick={() => setViewMonth((m) => subMonths(m, 1))} className={navBtn}>
          <ChevronLeft className="h-5 w-5" />
        </button>
        <p className="text-base font-bold text-indigo-900 dark:text-white">
          {format(viewMonth, "MMMM yyyy")}
        </p>
        <button type="button" aria-label="Next month" onClick={() => setViewMonth((m) => addMonths(m, 1))} className={navBtn}>
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1">
        {WEEKDAYS.map((day) => (
          <div key={day} className="flex h-10 items-center justify-center text-sm font-bold text-indigo-700 dark:text-white">
            {day}
          </div>
        ))}
        {days.map((day) => {
          const iso = format(day, "yyyy-MM-dd");
          const isSelected = selectedDate ? isSameDay(day, selectedDate) : false;
          const isToday = isSameDay(day, new Date());
          const inMonth = isSameMonth(day, viewMonth);

          return (
            <button
              key={iso}
              type="button"
              onClick={() => onSelect(iso)}
              className={cn(
                "flex h-10 w-10 items-center justify-center rounded-lg border-2 text-base font-semibold transition-colors",
                isSelected
                  ? "border-indigo-600 bg-indigo-600 text-white dark:border-white dark:bg-white dark:text-black"
                  : "border-transparent bg-white text-indigo-900 hover:border-indigo-400 hover:bg-indigo-50 dark:bg-black dark:text-white dark:hover:border-white dark:hover:bg-white/10",
                !inMonth && "text-indigo-300 dark:text-white/30",
                isToday && !isSelected && "underline decoration-indigo-500 dark:decoration-white"
              )}
            >
              {format(day, "d")}
            </button>
          );
        })}
      </div>
    </div>
  );
}
