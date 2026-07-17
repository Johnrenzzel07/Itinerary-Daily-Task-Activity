import { z } from "zod";

import { z } from "zod";
import { normalizeActivityTime } from "@/lib/utils";

export const activitySchema = z.object({
  activity: z
    .string()
    .min(1, "Activity is required")
    .max(5000, "Activity is too long")
    .transform((v) => v.trim()),
  statusId: z.string().min(1, "Status is required"),
  remarks: z
    .string()
    .max(2000, "Remarks are too long")
    .optional()
    .transform((v) => (v ?? "").trim()),
  activityDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Please select a valid date"),
  activityTime: z
    .string()
    .min(1, "Please select a valid time")
    .transform((value, ctx) => {
      try {
        return normalizeActivityTime(value);
      } catch {
        ctx.addIssue({
          code: "custom",
          message: "Please select a valid time",
        });
        return z.NEVER;
      }
    }),
});

export const statusSchema = z.object({
  name: z
    .string()
    .min(1, "Status name is required")
    .max(50, "Status name is too long")
    .transform((v) => v.trim()),
  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, "Color must be a valid hex code"),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const profileSchema = z.object({
  name: z.string().min(1).max(100).transform((v) => v.trim()),
  position: z.string().min(1).max(100).transform((v) => v.trim()),
  avatar: z.string().url().optional().or(z.literal("")),
});

export type ActivityInput = z.infer<typeof activitySchema>;
export type StatusInput = z.infer<typeof statusSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ProfileInput = z.infer<typeof profileSchema>;
