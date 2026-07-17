"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { Calendar, Clock, ClipboardList, Loader2, Sparkles, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AiTextTools } from "@/components/AiTextTools";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { createActivity, updateActivity } from "@/actions/activity";
import {
  formatActivityDate,
  formatActivityTime,
  normalizeActivityTime,
  parseActivityDateTime,
  toDateInputValue,
  toTimeInputValue,
} from "@/lib/utils";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import type { ActivityWithRelations, StatusItem } from "@/types";

interface ActivityFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  statuses: StatusItem[];
  activity?: ActivityWithRelations | null;
  onSuccess?: (activity?: ActivityWithRelations) => void;
}

function getDefaultDateTime(activity?: ActivityWithRelations | null) {
  const base = activity?.createdAt ? new Date(activity.createdAt) : new Date();
  return {
    date: toDateInputValue(base),
    time: toTimeInputValue(base),
  };
}

function handleTimeChange(value: string) {
  try {
    return normalizeActivityTime(value);
  } catch {
    return value;
  }
}

function FormSection({
  title,
  description,
  icon: Icon,
  children,
  className,
}: {
  title: string;
  description?: string;
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "rounded-2xl border-2 border-indigo-100 bg-white p-4 shadow-sm dark:border-white/15 dark:bg-black",
        className
      )}
    >
      <div className="mb-4 flex items-start gap-3">
        <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white dark:bg-white dark:text-black">
          <Icon className="h-5 w-5" />
        </span>
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">{title}</h3>
          {description && (
            <p className="admin-muted mt-1 text-sm leading-relaxed">{description}</p>
          )}
        </div>
      </div>
      {children}
    </section>
  );
}

const fieldClass =
  "min-h-[120px] resize-y border-2 border-indigo-100 bg-white text-base leading-relaxed dark:border-white/20 dark:bg-black";

export function ActivityForm({
  open,
  onOpenChange,
  statuses,
  activity,
  onSuccess,
}: ActivityFormProps) {
  const [statusId, setStatusId] = useState(activity?.statusId ?? "");
  const [activityText, setActivityText] = useState(activity?.activity ?? "");
  const [remarks, setRemarks] = useState(activity?.remarks ?? "");
  const [activityDate, setActivityDate] = useState(getDefaultDateTime(activity).date);
  const [activityTime, setActivityTime] = useState(getDefaultDateTime(activity).time);
  const [isPending, startTransition] = useTransition();
  const isEditing = !!activity;

  useEffect(() => {
    if (open) {
      const defaults = getDefaultDateTime(activity);
      setStatusId(activity?.statusId ?? "");
      setActivityText(activity?.activity ?? "");
      setRemarks(activity?.remarks ?? "");
      setActivityDate(defaults.date);
      setActivityTime(defaults.time);
    }
  }, [open, activity]);

  const scheduledPreview = useMemo(() => {
    try {
      const date = parseActivityDateTime(activityDate, activityTime);
      return `${formatActivityDate(date)} at ${formatActivityTime(date)}`;
    } catch {
      return "Select a valid date and time";
    }
  }, [activityDate, activityTime]);

  const selectedStatus = statuses.find((s) => s.id === statusId);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    formData.set("statusId", statusId);
    formData.set("activity", activityText);
    formData.set("remarks", remarks);
    formData.set("activityDate", activityDate);
    formData.set("activityTime", handleTimeChange(activityTime));

    startTransition(async () => {
      const result = isEditing
        ? await updateActivity(activity.id, formData)
        : await createActivity(formData);

      if (result.success) {
        const savedAt = parseActivityDateTime(activityDate, activityTime);
        toast.success(isEditing ? "Activity updated" : "Activity created", {
          description: `${formatActivityDate(savedAt)} at ${formatActivityTime(savedAt)}`,
        });
        onOpenChange(false);
        onSuccess?.(result.data);
      } else {
        toast.error(result.error ?? "Something went wrong");
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] max-w-2xl gap-0 overflow-hidden border-2 border-indigo-100 p-0 dark:border-white/15 [&>button]:top-5 [&>button]:border-white/25 [&>button]:bg-white/10 [&>button]:text-white [&>button]:hover:bg-white/20 dark:[&>button]:border-white/25 dark:[&>button]:bg-white/10 dark:[&>button]:text-white">
        <div className="border-b-2 border-indigo-100 bg-gradient-to-r from-indigo-600 to-violet-600 px-6 py-5 text-white dark:border-white/15 dark:from-black dark:to-black">
          <DialogHeader className="space-y-2 text-left">
            <div className="flex items-center gap-3">
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-white/15 ring-1 ring-white/25 dark:bg-white dark:text-black">
                <ClipboardList className="h-5 w-5" />
              </span>
              <div>
                <DialogTitle className="text-2xl font-bold text-white dark:text-white">
                  {isEditing ? "Edit Activity" : "Create Activity"}
                </DialogTitle>
                <DialogDescription className="mt-1 text-sm text-indigo-100 dark:text-white/70">
                  Log daily work with a custom date, time, status, and AI-polished text.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
        </div>

        <form onSubmit={handleSubmit} className="flex max-h-[calc(92vh-88px)] flex-col">
          <div className="space-y-4 overflow-y-auto px-6 py-5">
            <FormSection
              title="Schedule"
              description="Choose when this activity should appear on the itinerary."
              icon={Calendar}
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="activityDate" className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-indigo-600 dark:text-white" />
                    Date
                  </Label>
                  <Input
                    id="activityDate"
                    name="activityDate"
                    type="date"
                    value={activityDate}
                    onChange={(e) => setActivityDate(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="activityTime" className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-indigo-600 dark:text-white" />
                    Time
                  </Label>
                  <Input
                    id="activityTime"
                    name="activityTime"
                    type="time"
                    value={activityTime}
                    onChange={(e) => setActivityTime(handleTimeChange(e.target.value))}
                    required
                  />
                </div>
              </div>
              <p className="admin-muted mt-3 rounded-xl border border-indigo-100 bg-indigo-50/50 px-3 py-2 text-sm dark:border-white/15 dark:bg-white/5">
                Scheduled for: <span className="font-semibold text-indigo-800 dark:text-white">{scheduledPreview}</span>
              </p>
            </FormSection>

            <FormSection
              title="Activity Details"
              description="Describe the work performed. AI will rewrite it as a professional log entry."
              icon={ClipboardList}
            >
              <div className="space-y-3">
                <AiTextTools text={activityText} onResult={setActivityText} context="activity" />
                <Textarea
                  id="activity"
                  name="activity"
                  value={activityText}
                  onChange={(e) => setActivityText(e.target.value)}
                  placeholder="Example: Reviewed incoming documents and forwarded them to the concerned departments."
                  className={cn(fieldClass, "min-h-[140px]")}
                  required
                />
                <p className="admin-muted text-right text-xs">{activityText.length} / 5000 characters</p>
              </div>
            </FormSection>

            <FormSection title="Status" description="Select the current progress of this activity." icon={Tag}>
              <Select value={statusId} onValueChange={setStatusId} required>
                <SelectTrigger className="h-12 text-base">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {statuses.map((status) => (
                    <SelectItem key={status.id} value={status.id}>
                      <div className="flex items-center gap-2">
                        <span
                          className="h-2.5 w-2.5 rounded-full border border-black/10 dark:border-white/20"
                          style={{ backgroundColor: status.color }}
                        />
                        {status.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedStatus && (
                <p className="admin-muted mt-3 text-sm">
                  Selected: <span className="font-semibold text-indigo-800 dark:text-white">{selectedStatus.name}</span>
                </p>
              )}
            </FormSection>

            <FormSection
              title="Remarks"
              description="Optional notes such as follow-ups, blockers, or pending items."
              icon={Sparkles}
            >
              <div className="space-y-3">
                <AiTextTools text={remarks} onResult={setRemarks} context="remarks" />
                <Textarea
                  id="remarks"
                  name="remarks"
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="Example: Waiting for approval from supervisor."
                  className={cn(fieldClass, "min-h-[100px]")}
                />
                <p className="admin-muted text-right text-xs">{remarks.length} / 2000 characters</p>
              </div>
            </FormSection>
          </div>

          <div className="flex flex-col-reverse gap-2 border-t-2 border-indigo-100 bg-indigo-50/40 px-6 py-4 sm:flex-row sm:justify-end dark:border-white/15 dark:bg-black">
            <Button
              type="button"
              variant="outline"
              className="h-11 min-w-[120px] border-2"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="h-11 min-w-[160px]"
              disabled={isPending || !statusId || !activityDate || !activityTime || !activityText.trim()}
            >
              {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              {isEditing ? "Update Activity" : "Save Activity"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
