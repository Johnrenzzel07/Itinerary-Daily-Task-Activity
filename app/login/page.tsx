"use client";

import { Suspense, useTransition } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Loader2, ClipboardList, Lock, Mail } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/dashboard";
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    startTransition(async () => {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        toast.error("Invalid credentials");
        return;
      }

      toast.success("Welcome back!");
      router.push(callbackUrl);
      router.refresh();
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Welcome back</CardTitle>
        <CardDescription>
          Enter your credentials to access the admin dashboard
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-black/40 dark:text-white/40" />
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="admin@company.com"
                className="pl-10"
                defaultValue="admin@company.com"
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-black/40 dark:text-white/40" />
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                className="pl-10"
                defaultValue="admin123"
                required
              />
            </div>
          </div>
          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            Sign In
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-violet-50 p-4 dark:bg-black dark:from-black dark:via-black dark:to-black">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 dark:bg-white dark:text-black dark:shadow-none">
            <ClipboardList className="h-7 w-7" />
          </div>
          <h1 className="text-3xl font-bold text-indigo-800 dark:text-white">
            Admin Login
          </h1>
          <p className="admin-muted mt-2 text-base">
            Sign in to manage daily work itineraries
          </p>
        </div>

        <Suspense fallback={<div className="h-64 animate-pulse rounded-xl bg-black/10 dark:bg-white/10" />}>
          <LoginForm />
        </Suspense>

        <p className="admin-muted mt-6 text-center text-base">
          <Link href="/" className="font-medium text-indigo-600 hover:underline dark:text-white">
            ← Back to public itinerary
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
