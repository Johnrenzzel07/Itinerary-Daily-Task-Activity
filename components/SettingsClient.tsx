"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { useTheme } from "@/components/ThemeProvider";
import { updateSettings } from "@/actions/employee";

export function SettingsClient() {
  const { theme, setTheme, mounted } = useTheme();
  const [isPending, startTransition] = useTransition();

  const handleSave = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = await updateSettings(formData);
      if (result.success) {
        toast.success("Settings saved");
      }
    });
  };

  return (
    <>
      <Header
        title="Settings"
        subtitle="Configure your admin preferences"
        breadcrumbs={[
          { label: "Admin", href: "/dashboard" },
          { label: "Settings" },
        ]}
      />

      <div className="mx-auto max-w-2xl space-y-6 p-6">
        <Card>
          <CardHeader>
            <CardTitle>Appearance</CardTitle>
            <CardDescription>Customize how the dashboard looks</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-lg">Dark Mode</Label>
                <p className="admin-muted text-base">Switch between light and dark admin theme</p>
              </div>
              <Switch
                checked={mounted ? theme === "dark" : false}
                onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Notifications</CardTitle>
            <CardDescription>Manage notification preferences</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="notifications">Email Notifications</Label>
                  <p className="admin-muted text-base">
                    Receive updates about activity changes
                  </p>
                </div>
                <Switch id="notifications" name="notifications" value="true" />
              </div>
              <input type="hidden" name="theme" value={theme} />
              <Separator />
              <Button type="submit" disabled={isPending}>
                Save Settings
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Keyboard Shortcuts</CardTitle>
          </CardHeader>
          <CardContent className="admin-muted space-y-2 text-base">
            <p>
              <kbd className="rounded border-2 border-black/15 px-2 py-1 font-mono text-sm dark:border-white/20">Ctrl</kbd>{" "}
              +{" "}
              <kbd className="rounded border-2 border-black/15 px-2 py-1 font-mono text-sm dark:border-white/20">K</kbd>{" "}
              — Open command palette
            </p>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
