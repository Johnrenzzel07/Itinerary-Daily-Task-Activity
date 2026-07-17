"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { statusSchema } from "@/lib/validations";
import { getDefaultStatusColor } from "@/lib/utils";

async function requireAuth() {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }
  return session;
}

export async function getStatuses() {
  return prisma.status.findMany({ orderBy: { name: "asc" } });
}

export async function createStatus(formData: FormData) {
  await requireAuth();

  const raw = {
    name: formData.get("name") as string,
    color: formData.get("color") as string,
  };

  const parsed = statusSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  try {
    const status = await prisma.status.create({ data: parsed.data });
    revalidatePath("/status");
    revalidatePath("/activities");
    revalidatePath("/dashboard");
    revalidatePath("/");
    return { success: true, data: status };
  } catch {
    return { success: false, error: "Status name already exists" };
  }
}

export async function updateStatus(id: string, formData: FormData) {
  await requireAuth();

  const raw = {
    name: formData.get("name") as string,
    color: formData.get("color") as string,
  };

  const parsed = statusSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  try {
    const status = await prisma.status.update({
      where: { id },
      data: parsed.data,
    });
    revalidatePath("/status");
    revalidatePath("/activities");
    revalidatePath("/dashboard");
    revalidatePath("/");
    return { success: true, data: status };
  } catch {
    return { success: false, error: "Could not update status" };
  }
}

export async function deleteStatus(id: string) {
  await requireAuth();

  const usageCount = await prisma.activity.count({ where: { statusId: id } });
  if (usageCount > 0) {
    return {
      success: false,
      error: "Cannot delete status that is in use by activities",
    };
  }

  await prisma.status.delete({ where: { id } });

  revalidatePath("/status");
  revalidatePath("/activities");
  revalidatePath("/dashboard");
  revalidatePath("/");

  return { success: true };
}

export async function seedDefaultStatuses() {
  const defaults = [
    "Pending",
    "Ongoing",
    "Completed",
    "Cancelled",
    "Need Revision",
    "Waiting Approval",
  ];

  for (const name of defaults) {
    await prisma.status.upsert({
      where: { name },
      update: {},
      create: { name, color: getDefaultStatusColor(name) },
    });
  }
}
