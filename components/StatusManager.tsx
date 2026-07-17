"use client";

import { useState, useTransition } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { StatusBadge } from "@/components/StatusBadge";
import { createStatus, updateStatus, deleteStatus } from "@/actions/status";
import type { StatusItem } from "@/types";

interface StatusManagerProps {
  initialStatuses: StatusItem[];
}

export function StatusManager({ initialStatuses }: StatusManagerProps) {
  const [statuses, setStatuses] = useState(initialStatuses);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<StatusItem | null>(null);
  const [deleting, setDeleting] = useState<StatusItem | null>(null);
  const [color, setColor] = useState("#000000");
  const [isPending, startTransition] = useTransition();

  const refresh = () => {
    startTransition(async () => {
      const { getStatuses } = await import("@/actions/status");
      const data = await getStatuses();
      setStatuses(data);
    });
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    formData.set("color", color);

    startTransition(async () => {
      const result = editing
        ? await updateStatus(editing.id, formData)
        : await createStatus(formData);

      if (result.success) {
        toast.success(editing ? "Status updated" : "Status created");
        setOpen(false);
        setEditing(null);
        refresh();
      } else {
        toast.error(result.error ?? "Failed to save status");
      }
    });
  };

  const handleDelete = () => {
    if (!deleting) return;
    startTransition(async () => {
      const result = await deleteStatus(deleting.id);
      if (result.success) {
        toast.success("Status deleted");
        setDeleting(null);
        refresh();
      } else {
        toast.error(result.error ?? "Failed to delete status");
      }
    });
  };

  return (
    <>
      <Header
        title="Status Manager"
        subtitle="Configure activity status labels and colors"
        breadcrumbs={[
          { label: "Admin", href: "/dashboard" },
          { label: "Status Manager" },
        ]}
      />

      <div className="space-y-6 p-6">
        <div className="flex justify-end">
          <Button
            onClick={() => {
              setEditing(null);
              setColor("#000000");
              setOpen(true);
            }}
          >
            <Plus className="h-4 w-4" /> Add Status
          </Button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {statuses.map((status) => (
            <Card key={status.id}>
              <CardContent className="flex items-center justify-between p-5">
                <div className="flex items-center gap-3">
                  <span
                    className="h-4 w-4 rounded-full border-2 border-white shadow-sm dark:border-white"
                    style={{ backgroundColor: status.color }}
                  />
                  <StatusBadge name={status.name} color={status.color} />
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setEditing(status);
                      setColor(status.color);
                      setOpen(true);
                    }}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setDeleting(status)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Status" : "Create Status"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                name="name"
                defaultValue={editing?.name ?? ""}
                placeholder="e.g. Completed"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="color">Color</Label>
              <div className="flex items-center gap-3">
                <Input
                  id="color"
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="h-10 w-16 cursor-pointer p-1"
                />
                <Input value={color} readOnly className="font-mono" />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {editing ? "Update" : "Create"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleting} onOpenChange={() => setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete status?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove &quot;{deleting?.name}&quot; if it is not in use.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
