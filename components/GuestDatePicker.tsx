"use client";

import * as React from "react";
import { format, parseISO } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GuestCalendar } from "@/components/GuestCalendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface GuestDatePickerProps {
  value: string;
  onChange: (value: string) => void;
  onApply: (value: string) => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  label?: string;
  className?: string;
}

export function GuestDatePicker({
  value,
  onChange,
  onApply,
  open: controlledOpen,
  onOpenChange,
  label = "Select date",
  className,
}: GuestDatePickerProps) {
  const [internalOpen, setInternalOpen] = React.useState(false);
  const open = controlledOpen ?? internalOpen;
  const setOpen = onOpenChange ?? setInternalOpen;

  const selected = value ? parseISO(value) : undefined;

  const handleSelect = (iso: string) => {
    onChange(iso);
    onApply(iso);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className={cn(
            "h-12 min-w-[220px] justify-start border-2 border-indigo-200 bg-white px-4 text-base font-semibold text-indigo-900 hover:border-indigo-500 hover:bg-indigo-50 dark:border-white dark:bg-black dark:text-white dark:hover:bg-white/10",
            className
          )}
        >
          <CalendarIcon className="mr-2 h-5 w-5 shrink-0" />
          {selected ? format(selected, "MM/dd/yyyy") : label}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="w-auto border-2 border-indigo-100 bg-white p-4 dark:border-white dark:bg-black"
      >
        <GuestCalendar selected={value} onSelect={handleSelect} />
      </PopoverContent>
    </Popover>
  );
}
