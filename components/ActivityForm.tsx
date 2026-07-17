"use client";

import { useEffect, useState, useTransition } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
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
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { createActivity, updateActivity } from "@/actions/activity";
import { toast } from "sonner";
import type { ActivityWithRelations, StatusItem } from "@/types";

interface ActivityFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  statuses: StatusItem[];
  activity?: ActivityWithRelations | null;
  onSuccess?: () => void;
}

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
  const [isPending, startTransition] = useTransition();
  const isEditing = !!activity;

  useEffect(() => {
    if (open) {
      setStatusId(activity?.statusId ?? "");
      setActivityText(activity?.activity ?? "");
      setRemarks(activity?.remarks ?? "");
    }
  }, [open, activity]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    formData.set("statusId", statusId);
    formData.set("activity", activityText);
    formData.set("remarks", remarks);

    startTransition(async () => {
      const result = isEditing
        ? await updateActivity(activity.id, formData)
        : await createActivity(formData);

      if (result.success) {
        toast.success(isEditing ? "Activity updated" : "Activity created", {
          description: `Saved at ${new Date().toLocaleTimeString()}`,
        });
        onOpenChange(false);
        onSuccess?.();
      } else {
        toast.error(result.error ?? "Something went wrong");
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Activity" : "Create Activity"}</DialogTitle>
          <DialogDescription>
            Date and time are captured automatically when you save. Use AI to fix grammar or
            paraphrase your text.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <Label htmlFor="activity">Activity</Label>
              <AiTextTools text={activityText} onResult={setActivityText} />
            </div>
            <Textarea
              id="activity"
              name="activity"
              value={activityText}
              onChange={(e) => setActivityText(e.target.value)}
              placeholder="Describe your daily work activity..."
              className="min-h-[160px]"
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Status</Label>
            <Select value={statusId} onValueChange={setStatusId} required>
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                {statuses.map((status) => (
                  <SelectItem key={status.id} value={status.id}>
                    <div className="flex items-center gap-2">
                      <span
                        className="h-2 w-2 rounded-full border border-black dark:border-white"
                        style={{ backgroundColor: status.color }}
                      />
                      {status.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <Label htmlFor="remarks">Remarks</Label>
              <AiTextTools text={remarks} onResult={setRemarks} />
            </div>
            <Textarea
              id="remarks"
              name="remarks"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="Optional remarks..."
              className="min-h-[80px]"
            />
          </div>

          <div className="rounded-xl border border-indigo-100 bg-indigo-50/50 p-3 text-xs text-slate-600 dark:border-white/15 dark:bg-black dark:text-white/60">
            <p>
              <strong>Date:</strong>{" "}
              {new Date().toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </p>
            <p>
              <strong>Time:</strong>{" "}
              {new Date().toLocaleTimeString("en-US", {
                hour: "numeric",
                minute: "2-digit",
              })}
            </p>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending || !statusId}>
              {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              {isEditing ? "Update Activity" : "Save Activity"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
