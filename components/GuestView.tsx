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
  ChevronUp,
  ChevronDown,
  Calendar,
  Moon,
  Sun,
} from "lucide-react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GuestDatePicker } from "@/components/GuestDatePicker";
import { ActivityTable } from "@/components/ActivityTable";
import { useTheme } from "@/components/ThemeProvider";
import { getGuestActivities, getPrimaryEmployee } from "@/actions/activity";
import {
  exportActivitiesToPDF,
  exportActivitiesToExcel,
  printActivities,
} from "@/lib/export";
import {
  guestActionBtn,
  guestAvatar,
  guestAvatarFallback,
  guestCard,
  guestDivider,
  guestEyebrow,
  guestIconBtn,
  guestInnerCard,
  guestInput,
  guestPresetActive,
  guestPresetInactive,
  guestPrimaryBtn,
  guestSelect,
  guestShell,
  guestStatCard,
  guestThemeToggle,
  guestTitle,
} from "@/lib/guest-theme";
import {
  formatGuestPeriodLabel,
  getGuestActivityCountLabel,
  toDateInputValue,
} from "@/lib/utils";
import { cn } from "@/lib/utils";
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
  const { theme, toggleTheme, mounted } = useTheme();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateLookup, setDateLookup] = useState<GuestDateLookup>({ preset: "today" });
  const [pickDate, setPickDate] = useState(toDateInputValue(new Date()));
  const [rangeStart, setRangeStart] = useState("");
  const [rangeEnd, setRangeEnd] = useState("");
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [rangeStartOpen, setRangeStartOpen] = useState(false);
  const [rangeEndOpen, setRangeEndOpen] = useState(false);
  const [browseDateVisible, setBrowseDateVisible] = useState(true);
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
    cn(
      "h-11 rounded-xl border-2 px-4 text-base font-semibold transition-colors",
      dateLookup.preset === preset ? guestPresetActive : guestPresetInactive
    );

  return (
    <div className={guestShell}>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-10">
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between"
        >
          <div>
            <p className={guestEyebrow}>Daily Work Itinerary</p>
            <h1 className={cn("mt-2 text-3xl font-bold leading-tight sm:text-4xl", guestTitle)}>
              {periodLabel}
            </h1>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="icon"
              className={guestThemeToggle}
              onClick={toggleTheme}
              aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            >
              {mounted && theme === "dark" ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </Button>
            <Button variant="outline" className={guestActionBtn} onClick={refresh}>
              <RefreshCw className="h-5 w-5" />
              Refresh
            </Button>
            <Button
              variant="outline"
              className={guestActionBtn}
              onClick={() =>
                exportActivitiesToExcel(filtered, {
                  employee: currentEmployee
                    ? { name: currentEmployee.name, position: currentEmployee.position }
                    : null,
                })
              }
            >
              <FileSpreadsheet className="h-5 w-5" />
              Export Excel
            </Button>
            <Button variant="outline" className={guestActionBtn} onClick={() => exportActivitiesToPDF(filtered)}>
              <FileDown className="h-5 w-5" />
              Export PDF
            </Button>
            <Button variant="outline" className={guestActionBtn} onClick={() => printActivities(filtered)}>
              <Printer className="h-5 w-5" />
              Print
            </Button>
            <Button
              variant="ghost"
              className="h-11 px-4 text-base text-indigo-700 underline hover:bg-indigo-50 dark:text-white dark:hover:bg-white/10"
              asChild
            >
              <Link href="/login">
                <Shield className="h-5 w-5" />
                Admin
              </Link>
            </Button>
          </div>
        </motion.div>

        <section className={cn("mb-6 p-5 sm:p-6", guestCard)}>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm font-bold uppercase tracking-wider text-indigo-700 dark:text-white">
              Browse by Date
            </p>
            <Button
              type="button"
              variant="outline"
              className={guestActionBtn}
              onClick={() => setBrowseDateVisible((visible) => !visible)}
              aria-expanded={browseDateVisible}
              aria-controls="browse-by-date-panel"
            >
              {browseDateVisible ? (
                <>
                  <ChevronUp className="h-4 w-4" />
                  Hide
                </>
              ) : (
                <>
                  <ChevronDown className="h-4 w-4" />
                  Unhide
                </>
              )}
            </Button>
          </div>

          {browseDateVisible && (
            <div id="browse-by-date-panel">
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
            <div className={guestInnerCard}>
              <p className="mb-3 flex items-center gap-2 text-base font-bold text-indigo-900 dark:text-white">
                <Calendar className="h-5 w-5" />
                Look up a specific date
              </p>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                {isSingleDayView && (
                  <Button
                    type="button"
                    variant="outline"
                    className={guestIconBtn}
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
                    className={guestIconBtn}
                    onClick={() => shiftSingleDay(1)}
                    aria-label="Next day"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </Button>
                )}
                <Button type="button" className={guestPrimaryBtn} onClick={() => setCalendarOpen(true)}>
                  View Date
                </Button>
              </div>
              <p className="guest-muted mt-3 text-sm font-medium">
                Click the date or &quot;View Date&quot; to open the calendar, then pick a day.
              </p>
            </div>

            <div className={guestInnerCard}>
              <p className="mb-3 text-base font-bold text-indigo-900 dark:text-white">Look up a date range</p>
              <div className="flex flex-col gap-3">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-sm font-semibold text-indigo-800 dark:text-white">From</label>
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
                    <label className="mb-1 block text-sm font-semibold text-indigo-800 dark:text-white">To</label>
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
                <Button type="button" className={guestPrimaryBtn} onClick={applyDateRange}>
                  View Range
                </Button>
              </div>
            </div>
          </div>
            </div>
          )}
        </section>

        <section className={cn("mb-8 p-6 sm:p-8", guestCard)}>
          <div className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-5">
              <Avatar className={guestAvatar}>
                <AvatarImage src={currentEmployee?.avatar ?? undefined} />
                <AvatarFallback className={guestAvatarFallback}>{initials ?? "EM"}</AvatarFallback>
              </Avatar>
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-bold uppercase tracking-wider text-indigo-700 dark:text-white">Name</p>
                  <p className={cn("mt-1 text-2xl font-bold leading-snug sm:text-3xl", guestTitle)}>
                    {currentEmployee?.name ?? "Employee Name"}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-bold uppercase tracking-wider text-indigo-700 dark:text-white">
                    Position
                  </p>
                  <p className="mt-1 text-xl font-semibold leading-snug text-indigo-950 dark:text-white">
                    {currentEmployee?.position ?? "Position"}
                  </p>
                </div>
              </div>
            </div>
            <div className={guestDivider} />
            <div className={cn("text-center md:text-right", guestStatCard)}>
              <p className="guest-muted text-base font-medium">Selected period</p>
              <p className="mt-1 text-4xl font-bold text-indigo-700 dark:text-white">{filtered.length}</p>
              <p className="guest-muted text-base font-medium">{countLabel}</p>
            </div>
          </div>
        </section>

        <div className="mb-6 flex flex-col gap-4 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-indigo-500 dark:text-white" />
            <Input
              placeholder="Search activity, status, remarks..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={guestInput}
            />
          </div>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className={guestSelect}>
            <option value="all">All Statuses</option>
            <option value="completed">Completed</option>
            <option value="pending">Pending</option>
            <option value="ongoing">Ongoing</option>
            <option value="cancelled">Cancelled</option>
            <option value="need revision">Need Revision</option>
          </select>
        </div>

        <ActivityTable activities={filtered} isLoading={isLoading && !data} stickyHeader variant="guest" />
      </div>
    </div>
  );
}
