"use client";

import { useState, useTransition, useCallback, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  Plus,
  FileDown,
  FileSpreadsheet,
  Printer,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { toast } from "sonner";
import { Header } from "@/components/Header";
import { SearchBar } from "@/components/SearchBar";
import { ActivityTable } from "@/components/ActivityTable";
import { ActivityForm } from "@/components/ActivityForm";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  getActivities,
  deleteActivity,
  restoreActivity,
} from "@/actions/activity";
import {
  exportActivitiesToPDF,
  exportActivitiesToExcel,
  printActivities,
} from "@/lib/export";
import type { ActivityWithRelations, StatusItem } from "@/types";

interface ActivitiesClientProps {
  initialActivities: ActivityWithRelations[];
  initialTotal: number;
  statuses: StatusItem[];
}

export function ActivitiesClient({
  initialActivities,
  initialTotal,
  statuses,
}: ActivitiesClientProps) {
  const searchParams = useSearchParams();
  const [activities, setActivities] = useState(initialActivities);
  const [total, setTotal] = useState(initialTotal);
  const [search, setSearch] = useState("");
  const [dateRange, setDateRange] = useState("all");
  const [statusId, setStatusId] = useState("all");
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "status">("newest");
  const [page, setPage] = useState(1);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<ActivityWithRelations | null>(null);
  const [deleting, setDeleting] = useState<ActivityWithRelations | null>(null);
  const [isPending, startTransition] = useTransition();

  const limit = 10;

  const loadActivities = useCallback(() => {
    startTransition(async () => {
      const result = await getActivities({
        search,
        dateRange: dateRange as "today" | "yesterday" | "week" | "month" | "all",
        statusId: statusId === "all" ? undefined : statusId,
        sortBy,
        page,
        limit,
      });
      setActivities(result.activities);
      setTotal(result.total);
    });
  }, [search, dateRange, statusId, sortBy, page]);

  useEffect(() => {
    loadActivities();
  }, [loadActivities]);

  useEffect(() => {
    if (searchParams.get("create") === "true") {
      setFormOpen(true);
    }
  }, [searchParams]);

  const handleDelete = () => {
    if (!deleting) return;
    const snapshot = deleting;
    startTransition(async () => {
      await deleteActivity(snapshot.id);
      toast.success("Activity deleted", {
        action: {
          label: "Undo",
          onClick: async () => {
            await restoreActivity({
              employeeId: snapshot.employeeId,
              activity: snapshot.activity,
              statusId: snapshot.statusId,
              remarks: snapshot.remarks,
              createdAt: new Date(snapshot.createdAt),
            });
            loadActivities();
            toast.success("Activity restored");
          },
        },
      });
      setDeleting(null);
      loadActivities();
    });
  };

  const totalPages = Math.max(1, Math.ceil(total / limit));

  return (
    <>
      <Header
        title="Activities"
        subtitle="Manage daily work itinerary entries"
        breadcrumbs={[
          { label: "Admin", href: "/dashboard" },
          { label: "Activities" },
        ]}
      />

      <div className="space-y-6 p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <SearchBar
            search={search}
            onSearchChange={(v) => {
              setSearch(v);
              setPage(1);
            }}
            dateRange={dateRange}
            onDateRangeChange={(v) => {
              setDateRange(v);
              setPage(1);
            }}
            statusId={statusId}
            onStatusChange={(v) => {
              setStatusId(v);
              setPage(1);
            }}
            statuses={statuses}
          />

          <div className="flex flex-wrap gap-2">
            <select
              value={sortBy}
              onChange={(e) =>
                setSortBy(e.target.value as "newest" | "oldest" | "status")
              }
              className="h-12 rounded-xl border-2 border-indigo-100 bg-white px-4 text-base text-slate-900 dark:border-white/20 dark:bg-black dark:text-white"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="status">By Status</option>
            </select>
            <Button
              variant="outline"
              size="sm"
              onClick={() => exportActivitiesToPDF(activities)}
            >
              <FileDown className="h-4 w-4" /> PDF
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => exportActivitiesToExcel(activities)}
            >
              <FileSpreadsheet className="h-4 w-4" /> Excel
            </Button>
            <Button variant="outline" size="sm" onClick={() => printActivities(activities)}>
              <Printer className="h-4 w-4" /> Print
            </Button>
            <Button onClick={() => { setEditing(null); setFormOpen(true); }}>
              <Plus className="h-4 w-4" /> New Activity
            </Button>
          </div>
        </div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <ActivityTable
            activities={activities}
            isLoading={isPending}
            showActions
            onEdit={(a) => {
              setEditing(a);
              setFormOpen(true);
            }}
            onDelete={setDeleting}
          />
        </motion.div>

        <div className="flex items-center justify-between">
          <p className="admin-muted text-base">
            Showing {(page - 1) * limit + 1}–{Math.min(page * limit, total)} of {total}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <ActivityForm
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open);
          if (!open) setEditing(null);
        }}
        statuses={statuses}
        activity={editing}
        onSuccess={loadActivities}
      />

      <AlertDialog open={!!deleting} onOpenChange={() => setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete activity?</AlertDialogTitle>
            <AlertDialogDescription>
              This action can be undone immediately after deletion.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => { setEditing(null); setFormOpen(true); }}
        className="fixed bottom-8 right-8 flex h-14 w-14 items-center justify-center rounded-full bg-black text-white shadow-xl lg:hidden"
      >
        <Plus className="h-6 w-6" />
      </motion.button>
    </>
  );
}
