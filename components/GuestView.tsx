"use client";

import { useCallback, useEffect, useMemo, useState, useTransition } from "react";
import { motion } from "framer-motion";
import { parseISO, subDays, addDays } from "date-fns";
import {
  FileSpreadsheet,
  FileDown,
  Printer,
  Search,
  RefreshCw,
  Shield,
  ChevronLeft,
  ChevronRight,
  Calendar,
} from "lucide-react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GuestDatePicker } from "@/components/GuestDatePicker";
import { ActivityTable } from "@/components/ActivityTable";
import { getGuestActivities, getPrimaryEmployee } from "@/actions/activity";
import {
  exportActivitiesToPDF,
  exportActivitiesToExcel,
  printActivities,
} from "@/lib/export";
import {
  formatGuestPeriodLabel,
  getGuestActivityCountLabel,
  toDateInputValue,
} from "@/lib/utils";
import type { ActivityWithRelations, EmployeeProfile, GuestDateLookup, GuestDatePreset } from "@/types";

interface GuestViewProps {
  initialActivities: ActivityWithRelations[];
  employee: EmployeeProfile | null;
  todayLabel: string;
}

const PRESET_OPTIONS: { value: GuestDatePreset; label: string }[] = [
  { value: "today", label: "Today" },
  { value: "yesterday", label: "Yesterday" },
  { value: "week", label: "This Week" },
  { value: "month", label: "This Month" },
  { value: "all", label: "All Time" },
];

export function GuestView({ initialActivities, employee, todayLabel }: GuestViewProps) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateLookup, setDateLookup] = useState<GuestDateLookup>({ preset: "today" });
  const [pickDate, setPickDate] = useState(toDateInputValue(new Date()));
  const [rangeStart, setRangeStart] = useState("");
  const [rangeEnd, setRangeEnd] = useState("");
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [rangeStartOpen, setRangeStartOpen] = useState(false);
  const [rangeEndOpen, setRangeEndOpen] = useState(false);
  const [data, setData] = useState<{
    activities: ActivityWithRelations[];
    employee: EmployeeProfile | null;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [, startTransition] = useTransition();

  const fetchData = useCallback(async () => {
    const [activities, emp] = await Promise.all([
      getGuestActivities(dateLookup),
      getPrimaryEmployee(),
    ]);
    return { activities, employee: emp };
  }, [dateLookup]);

  const refresh = useCallback(() => {
    startTransition(async () => {
      setIsLoading(true);
      try {
        const result = await fetchData();
        setData(result);
      } finally {
        setIsLoading(false);
      }
    });
  }, [fetchData]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const activities = data?.activities ?? initialActivities;
  const currentEmployee = data?.employee ?? employee;

  const periodLabel =
    dateLookup.preset === "today" && !data
      ? todayLabel
      : formatGuestPeriodLabel(dateLookup);

  const countLabel = getGuestActivityCountLabel(dateLookup.preset);

  const isSingleDayView =
    dateLookup.preset === "today" ||
    dateLookup.preset === "yesterday" ||
    (dateLookup.preset === "custom" &&
      dateLookup.startDate &&
      dateLookup.startDate === dateLookup.endDate);

  const currentSingleDate = useMemo(() => {
    if (dateLookup.preset === "today") return new Date();
    if (dateLookup.preset === "yesterday") return subDays(new Date(), 1);
    if (dateLookup.preset === "custom" && dateLookup.startDate) {
      return parseISO(dateLookup.startDate);
    }
    return new Date();
  }, [dateLookup]);

  const filtered = useMemo(() => {
    return activities.filter((a) => {
      const matchesSearch =
        !search ||
        a.activity.toLowerCase().includes(search.toLowerCase()) ||
        a.remarks.toLowerCase().includes(search.toLowerCase()) ||
        a.status.name.toLowerCase().includes(search.toLowerCase());

      const matchesStatus =
        statusFilter === "all" ||
        a.status.name.toLowerCase() === statusFilter.toLowerCase();

      return matchesSearch && matchesStatus;
    });
  }, [activities, search, statusFilter]);

  const initials = currentEmployee?.name
    ?.split(" ")
    .map((n: string) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const applyPreset = (preset: GuestDatePreset) => {
    setDateLookup({ preset });
    if (preset === "today") {
      setPickDate(toDateInputValue(new Date()));
    }
  };

  const applyPickedDate = (iso?: string) => {
    const date = iso ?? pickDate;
    if (!date) return;
    setPickDate(date);
    setDateLookup({
      preset: "custom",
      startDate: date,
      endDate: date,
    });
  };

  const applyDateRange = () => {
    if (!rangeStart && !rangeEnd) return;
    setDateLookup({
      preset: "custom",
      startDate: rangeStart || rangeEnd,
      endDate: rangeEnd || rangeStart,
    });
  };

  const shiftSingleDay = (direction: -1 | 1) => {
    const next = addDays(currentSingleDate, direction);
    const iso = toDateInputValue(next);
    setPickDate(iso);
    setDateLookup({
      preset: "custom",
      startDate: iso,
      endDate: iso,
    });
  };

  const presetButtonClass = (preset: GuestDatePreset) =>
    `h-11 rounded-xl border-2 px-4 text-base font-semibold transition-colors ${
      dateLookup.preset === preset
        ? "border-black bg-black text-white"
        : "border-black bg-white text-black hover:bg-black hover:text-white"
    }`;

  return (
    <div className="min-h-screen bg-white text-black" style={{ colorScheme: "light" }}>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-10">
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between"
        >
          <div>
            <p className="text-base font-bold uppercase tracking-widest text-black">
              Daily Work Itinerary
            </p>
            <h1 className="mt-2 text-3xl font-bold leading-tight sm:text-4xl">
              {periodLabel}
            </h1>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              className="h-11 border-2 border-black bg-white px-4 text-base text-black hover:bg-black hover:text-white"
              onClick={refresh}
            >
              <RefreshCw className="h-5 w-5" />
              Refresh
            </Button>
            <Button
              variant="outline"
              className="h-11 border-2 border-black bg-white px-4 text-base text-black hover:bg-black hover:text-white"
              onClick={() => exportActivitiesToExcel(filtered)}
            >
              <FileSpreadsheet className="h-5 w-5" />
              Export Excel
            </Button>
            <Button
              variant="outline"
              className="h-11 border-2 border-black bg-white px-4 text-base text-black hover:bg-black hover:text-white"
              onClick={() => exportActivitiesToPDF(filtered)}
            >
              <FileDown className="h-5 w-5" />
              Export PDF
            </Button>
            <Button
              variant="outline"
              className="h-11 border-2 border-black bg-white px-4 text-base text-black hover:bg-black hover:text-white"
              onClick={() => printActivities(filtered)}
            >
              <Printer className="h-5 w-5" />
              Print
            </Button>
            <Button
              variant="ghost"
              className="h-11 px-4 text-base text-black underline hover:bg-black/5"
              asChild
            >
              <Link href="/login">
                <Shield className="h-5 w-5" />
                Admin
              </Link>
            </Button>
          </div>
        </motion.div>

        <section className="mb-6 rounded-2xl border-2 border-black bg-white p-5 sm:p-6">
          <p className="mb-4 text-sm font-bold uppercase tracking-wider text-black">
            Browse by Date
          </p>
          <div className="flex flex-wrap gap-2">
            {PRESET_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => applyPreset(option.value)}
                className={presetButtonClass(option.value)}
              >
                {option.label}
              </button>
            ))}
          </div>

          <div className="mt-5 grid gap-4 lg:grid-cols-2">
            <div className="rounded-xl border-2 border-black p-4">
              <p className="mb-3 flex items-center gap-2 text-base font-bold">
                <Calendar className="h-5 w-5" />
                Look up a specific date
              </p>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                {isSingleDayView && (
                  <Button
                    type="button"
                    variant="outline"
                    className="h-12 w-12 shrink-0 border-2 border-black bg-white p-0 text-black hover:bg-black hover:text-white"
                    onClick={() => shiftSingleDay(-1)}
                    aria-label="Previous day"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </Button>
                )}
                <GuestDatePicker
                  value={pickDate}
                  onChange={setPickDate}
                  onApply={applyPickedDate}
                  open={calendarOpen}
                  onOpenChange={setCalendarOpen}
                  className="flex-1"
                />
                {isSingleDayView && (
                  <Button
                    type="button"
                    variant="outline"
                    className="h-12 w-12 shrink-0 border-2 border-black bg-white p-0 text-black hover:bg-black hover:text-white"
                    onClick={() => shiftSingleDay(1)}
                    aria-label="Next day"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </Button>
                )}
                <Button
                  type="button"
                  className="h-12 border-2 border-black bg-black px-6 text-base text-white hover:bg-white hover:text-black"
                  onClick={() => setCalendarOpen(true)}
                >
                  View Date
                </Button>
              </div>
              <p className="mt-3 text-sm font-medium text-black">
                Click the date or &quot;View Date&quot; to open the calendar, then pick a day.
              </p>
            </div>

            <div className="rounded-xl border-2 border-black p-4">
              <p className="mb-3 text-base font-bold">Look up a date range</p>
              <div className="flex flex-col gap-3">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-sm font-semibold">From</label>
                    <GuestDatePicker
                      value={rangeStart}
                      onChange={setRangeStart}
                      onApply={(iso) => setRangeStart(iso)}
                      open={rangeStartOpen}
                      onOpenChange={setRangeStartOpen}
                      label="Start date"
                      className="w-full min-w-0"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-semibold">To</label>
                    <GuestDatePicker
                      value={rangeEnd}
                      onChange={setRangeEnd}
                      onApply={(iso) => setRangeEnd(iso)}
                      open={rangeEndOpen}
                      onOpenChange={setRangeEndOpen}
                      label="End date"
                      className="w-full min-w-0"
                    />
                  </div>
                </div>
                <Button
                  type="button"
                  className="h-12 border-2 border-black bg-black text-base text-white hover:bg-white hover:text-black"
                  onClick={applyDateRange}
                >
                  View Range
                </Button>
              </div>
            </div>
          </div>
        </section>

        <section className="mb-8 rounded-2xl border-2 border-black bg-white p-6 sm:p-8">
          <div className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-5">
              <Avatar className="h-20 w-20 border-2 border-black">
                <AvatarImage src={currentEmployee?.avatar ?? undefined} />
                <AvatarFallback className="bg-black text-xl font-bold text-white">
                  {initials ?? "EM"}
                </AvatarFallback>
              </Avatar>
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-bold uppercase tracking-wider text-black">
                    Name
                  </p>
                  <p className="mt-1 text-2xl font-bold leading-snug sm:text-3xl">
                    {currentEmployee?.name ?? "Employee Name"}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-bold uppercase tracking-wider text-black">
                    Position
                  </p>
                  <p className="mt-1 text-xl font-semibold leading-snug">
                    {currentEmployee?.position ?? "Position"}
                  </p>
                </div>
              </div>
            </div>
            <div className="hidden h-px flex-1 bg-black md:mx-8 md:block" />
            <div className="rounded-xl border-2 border-black px-6 py-4 text-center md:text-right">
              <p className="text-base font-medium text-black">Selected period</p>
              <p className="mt-1 text-4xl font-bold">{filtered.length}</p>
              <p className="text-base font-medium text-black">{countLabel}</p>
            </div>
          </div>
        </section>

        <div className="mb-6 flex flex-col gap-4 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-black" />
            <Input
              placeholder="Search activity, status, remarks..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-12 border-2 border-black bg-white pl-12 text-base text-black placeholder:text-black/50"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-12 rounded-xl border-2 border-black bg-white px-4 text-base font-medium text-black"
          >
            <option value="all">All Statuses</option>
            <option value="completed">Completed</option>
            <option value="pending">Pending</option>
            <option value="ongoing">Ongoing</option>
            <option value="cancelled">Cancelled</option>
            <option value="need revision">Need Revision</option>
          </select>
        </div>

        <ActivityTable
          activities={filtered}
          isLoading={isLoading && !data}
          stickyHeader
          variant="guest"
        />
      </div>
    </div>
  );
}
