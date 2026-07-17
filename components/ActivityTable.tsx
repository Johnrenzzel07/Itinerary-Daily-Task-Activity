"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  formatActivityDate,
  formatActivityTime,
  getNextSortDirection,
  sortActivities,
} from "@/lib/utils";
import { StatusBadge } from "@/components/StatusBadge";
import { Skeleton } from "@/components/ui/skeleton";
import type {
  ActivitySortColumn,
  ActivitySortDirection,
  ActivityWithRelations,
} from "@/types";
import { ArrowDown, ArrowUp, ArrowUpDown, ClipboardList } from "lucide-react";
import { cn } from "@/lib/utils";

const TABLE_COLUMNS: { key: ActivitySortColumn; label: string }[] = [
  { key: "date", label: "Date" },
  { key: "time", label: "Time" },
  { key: "activity", label: "Activity" },
  { key: "status", label: "Status" },
  { key: "remarks", label: "Remarks" },
];

interface ActivityTableProps {
  activities: ActivityWithRelations[];
  isLoading?: boolean;
  showActions?: boolean;
  onEdit?: (activity: ActivityWithRelations) => void;
  onDelete?: (activity: ActivityWithRelations) => void;
  stickyHeader?: boolean;
  variant?: "default" | "guest";
  sortColumn?: ActivitySortColumn;
  sortDirection?: ActivitySortDirection;
  onSortChange?: (column: ActivitySortColumn, direction: ActivitySortDirection) => void;
}

export function ActivityTable({
  activities,
  isLoading = false,
  showActions = false,
  onEdit,
  onDelete,
  stickyHeader = true,
  variant = "default",
  sortColumn: controlledSortColumn,
  sortDirection: controlledSortDirection,
  onSortChange,
}: ActivityTableProps) {
  const isGuest = variant === "guest";
  const isControlled = controlledSortColumn !== undefined && controlledSortDirection !== undefined;

  const [internalSortColumn, setInternalSortColumn] = useState<ActivitySortColumn>("date");
  const [internalSortDirection, setInternalSortDirection] =
    useState<ActivitySortDirection>("desc");

  const sortColumn = isControlled ? controlledSortColumn : internalSortColumn;
  const sortDirection = isControlled ? controlledSortDirection : internalSortDirection;

  const displayedActivities = useMemo(() => {
    if (isControlled) {
      return activities;
    }

    return sortActivities(activities, sortColumn, sortDirection);
  }, [activities, isControlled, sortColumn, sortDirection]);

  const handleSort = (column: ActivitySortColumn) => {
    const nextDirection = getNextSortDirection(column, sortColumn, sortDirection);

    if (onSortChange) {
      onSortChange(column, nextDirection);
      return;
    }

    setInternalSortColumn(column);
    setInternalSortDirection(nextDirection);
  };

  const SortIcon = ({ column }: { column: ActivitySortColumn }) => {
    if (sortColumn !== column) {
      return <ArrowUpDown className="h-4 w-4 opacity-60" aria-hidden="true" />;
    }

    return sortDirection === "asc" ? (
      <ArrowUp className="h-4 w-4" aria-hidden="true" />
    ) : (
      <ArrowDown className="h-4 w-4" aria-hidden="true" />
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton
            key={i}
            className={cn("w-full", isGuest ? "h-16 bg-black/10" : "h-14")}
          />
        ))}
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div
        className={cn(
          "flex flex-col items-center justify-center rounded-xl border border-dashed py-16 text-center",
          isGuest
            ? "border-2 border-dashed border-indigo-200 bg-white dark:border-white dark:bg-black"
            : "border-black/20 dark:border-white/20"
        )}
      >
        <div
          className={cn(
            "mb-4 rounded-full border p-4",
            isGuest ? "border-2 border-indigo-200 dark:border-white" : "border-black/15 dark:border-white/15"
          )}
        >
          <ClipboardList
            className={cn("h-8 w-8", isGuest ? "text-indigo-600 dark:text-white" : "text-black/50 dark:text-white/50")}
          />
        </div>
        <h3 className={cn("font-semibold", isGuest ? "text-xl" : "text-lg")}>
          No activities found
        </h3>
        <p
          className={cn(
            "mt-2",
            isGuest ? "text-base text-slate-700 dark:text-white" : "admin-muted text-base"
          )}
        >
          Activities will appear here once they are created.
        </p>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "overflow-hidden rounded-xl border bg-white",
        isGuest
          ? "border-2 border-indigo-100 shadow-lg shadow-indigo-100/40 dark:border-white dark:bg-black dark:shadow-none"
          : "border-2 border-indigo-100 dark:border-white/20 dark:bg-black"
      )}
    >
      <div className="overflow-x-auto">
        <table
          className={cn(
            "w-full border-collapse",
            isGuest ? "min-w-[900px] text-base" : "min-w-[900px] text-base"
          )}
        >
          <thead
            className={cn(
              stickyHeader && "sticky top-0 z-10",
              isGuest
                ? "bg-gradient-to-r from-indigo-600 to-violet-600 text-white dark:bg-black dark:bg-none dark:text-white"
                : "bg-gradient-to-r from-indigo-600 to-violet-600 text-white dark:border-white/20 dark:bg-white dark:bg-none dark:text-black"
            )}
          >
            <tr>
              {TABLE_COLUMNS.map(({ key, label }) => (
                <th
                  key={key}
                  className={cn(
                    "text-left font-bold",
                    isGuest ? "px-5 py-4 text-base" : "px-5 py-4 text-base font-bold"
                  )}
                >
                  <button
                    type="button"
                    onClick={() => handleSort(key)}
                    className={cn(
                      "group inline-flex items-center gap-1.5 rounded-md transition-colors",
                      "hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80",
                      sortColumn === key && "underline decoration-2 underline-offset-4"
                    )}
                    aria-label={`Sort by ${label} ${
                      sortColumn === key
                        ? sortDirection === "asc"
                          ? "ascending"
                          : "descending"
                        : ""
                    }`}
                  >
                    <span>{label}</span>
                    <SortIcon column={key} />
                  </button>
                </th>
              ))}
              {showActions && (
                <th
                  className={cn(
                    "text-right font-semibold",
                    isGuest ? "px-5 py-4 text-base" : "px-4 py-3"
                  )}
                >
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            <AnimatePresence mode="popLayout">
              {displayedActivities.map((activity, index) => (
                <motion.tr
                  key={activity.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.25, delay: index * 0.03 }}
                  className={cn(
                    "border-b transition-colors",
                    isGuest
                      ? "border-indigo-50 bg-white even:bg-indigo-50/50 hover:bg-indigo-50 dark:border-white/20 dark:bg-black dark:even:bg-white/[0.04] dark:hover:bg-white/[0.06]"
                      : "border-indigo-50 bg-white hover:bg-indigo-50/60 even:bg-indigo-50/30 dark:border-white/10 dark:bg-black dark:hover:bg-white/[0.03] dark:even:bg-white/[0.02]"
                  )}
                >
                  <td
                    className={cn(
                      "whitespace-nowrap font-semibold text-black",
                      isGuest ? "px-5 py-4 font-semibold text-indigo-900 dark:text-white" : "px-5 py-4 font-semibold text-indigo-900 dark:text-white"
                    )}
                  >
                    {formatActivityDate(activity.createdAt)}
                  </td>
                  <td
                    className={cn(
                      "whitespace-nowrap text-black",
                      isGuest ? "px-5 py-4 font-medium text-slate-700 dark:text-white" : "px-5 py-4 font-medium text-slate-700 dark:text-white"
                    )}
                  >
                    {formatActivityTime(activity.createdAt)}
                  </td>
                  <td className={cn("max-w-md text-slate-800 dark:text-white", isGuest ? "px-5 py-4" : "px-5 py-4")}>
                    <p
                      className={cn(
                        "whitespace-pre-wrap text-base leading-relaxed",
                        isGuest ? "font-medium" : "font-medium"
                      )}
                    >
                      {activity.activity}
                    </p>
                  </td>
                  <td className={isGuest ? "px-5 py-4" : "px-5 py-4"}>
                    <StatusBadge
                      name={activity.status.name}
                      color={activity.status.color}
                      variant={isGuest ? "guest" : "default"}
                    />
                  </td>
                  <td
                    className={cn(
                      "max-w-xs text-black",
                      isGuest ? "px-5 py-4 text-base leading-relaxed text-slate-600 dark:text-white" : "px-5 py-4 text-base leading-relaxed text-slate-600 dark:text-white"
                    )}
                  >
                    {activity.remarks || "-"}
                  </td>
                  {showActions && (
                    <td className={isGuest ? "px-5 py-4 text-right" : "px-5 py-4 text-right"}>
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => onEdit?.(activity)}
                          className="rounded-lg border-2 border-indigo-200 px-3 py-1.5 text-sm font-semibold text-indigo-700 hover:bg-indigo-600 hover:text-white dark:border-white/20 dark:text-white dark:hover:bg-white dark:hover:text-black"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => onDelete?.(activity)}
                          className="rounded-lg border-2 border-rose-300 px-3 py-1.5 text-sm font-semibold text-rose-700 hover:bg-rose-500 hover:text-white dark:border-white dark:text-white dark:hover:bg-white dark:hover:text-black"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  )}
                </motion.tr>
              ))}
            </AnimatePresence>
          </tbody>
        </table>
      </div>
    </div>
  );
}
