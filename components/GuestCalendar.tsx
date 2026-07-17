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
  const [viewMonth, setViewMonth] = React.useState(
    selectedDate ?? new Date()
  );

  const monthStart = startOfMonth(viewMonth);
  const monthEnd = endOfMonth(viewMonth);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);
  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  return (
    <div className={cn("w-[320px] select-none", className)}>
      <div className="mb-4 flex items-center justify-between">
        <button
          type="button"
          aria-label="Previous month"
          onClick={() => setViewMonth((m) => subMonths(m, 1))}
          className="inline-flex h-10 w-10 items-center justify-center rounded-lg border-2 border-black bg-white text-black hover:bg-black hover:text-white"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <p className="text-base font-bold text-black">
          {format(viewMonth, "MMMM yyyy")}
        </p>
        <button
          type="button"
          aria-label="Next month"
          onClick={() => setViewMonth((m) => addMonths(m, 1))}
          className="inline-flex h-10 w-10 items-center justify-center rounded-lg border-2 border-black bg-white text-black hover:bg-black hover:text-white"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1">
        {WEEKDAYS.map((day) => (
          <div
            key={day}
            className="flex h-10 items-center justify-center text-sm font-bold text-black"
          >
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
                  ? "border-black bg-black text-white"
                  : "border-transparent bg-white text-black hover:border-black hover:bg-black/5",
                !inMonth && "text-black/30",
                isToday && !isSelected && "underline"
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
