"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { profileSchema } from "@/lib/validations";

export async function getProfile() {
  const session = await auth();
  if (!session?.user?.id) return null;

  return prisma.employee.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      position: true,
      email: true,
      avatar: true,
      createdAt: true,
    },
  });
}

export async function updateProfile(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized" };
  }

  const raw = {
    name: formData.get("name") as string,
    position: formData.get("position") as string,
    avatar: (formData.get("avatar") as string) || "",
  };

  const parsed = profileSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const employee = await prisma.employee.update({
    where: { id: session.user.id },
    data: {
      name: parsed.data.name,
      position: parsed.data.position,
      avatar: parsed.data.avatar || null,
    },
  });

  revalidatePath("/");
  revalidatePath("/profile");

  return { success: true, data: employee };
}

export async function updateSettings(formData: FormData) {
  await auth();
  const theme = formData.get("theme") as string;
  const notifications = formData.get("notifications") === "true";

  return {
    success: true,
    data: { theme, notifications },
  };
}
