"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { updateProfile } from "@/actions/employee";
import type { EmployeeProfile } from "@/types";

interface ProfileClientProps {
  profile: EmployeeProfile & { createdAt?: Date };
}

export function ProfileClient({ profile }: ProfileClientProps) {
  const [isPending, startTransition] = useTransition();

  const initials = profile.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const result = await updateProfile(formData);
      if (result.success) {
        toast.success("Profile updated successfully");
      } else {
        toast.error(result.error ?? "Failed to update profile");
      }
    });
  };

  return (
    <>
      <Header
        title="Profile"
        subtitle="Manage your employee information"
        breadcrumbs={[
          { label: "Admin", href: "/dashboard" },
          { label: "Profile" },
        ]}
      />

      <div className="mx-auto max-w-2xl space-y-6 p-6">
        <Card>
          <CardHeader className="flex flex-row items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={profile.avatar ?? undefined} />
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle>{profile.name}</CardTitle>
              <p className="admin-muted text-base">{profile.email}</p>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" name="name" defaultValue={profile.name} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="position">Position</Label>
                <Input
                  id="position"
                  name="position"
                  defaultValue={profile.position}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="avatar">Avatar URL</Label>
                <Input
                  id="avatar"
                  name="avatar"
                  defaultValue={profile.avatar ?? ""}
                  placeholder="https://..."
                />
              </div>
              <Button type="submit" disabled={isPending}>
                Save Changes
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
