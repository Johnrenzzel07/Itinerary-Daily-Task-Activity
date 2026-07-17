"use server";

import { revalidatePath, unstable_noStore as noStore } from "next/cache";
import {
  startOfDay,
  endOfDay,
  subDays,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  parseISO,
  isValid,
} from "date-fns";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { activitySchema } from "@/lib/validations";
import { parseActivityDateTime } from "@/lib/utils";
import type { ActivityFilters, ActivitySortColumn, ActivitySortDirection, ActivityWithRelations, GuestDateLookup } from "@/types";

async function requireAuth() {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }
  return session;
}

function buildDateFilter(
  dateRange?: ActivityFilters["dateRange"],
  startDate?: string,
  endDate?: string
) {
  if (dateRange === "custom") {
    const start = startDate && isValid(parseISO(startDate)) ? parseISO(startDate) : null;
    const end = endDate && isValid(parseISO(endDate)) ? parseISO(endDate) : null;

    if (start && end) {
      return { gte: startOfDay(start), lte: endOfDay(end) };
    }
    if (start) {
      return { gte: startOfDay(start), lte: endOfDay(start) };
    }
    if (end) {
      return { gte: startOfDay(end), lte: endOfDay(end) };
    }
    return undefined;
  }

  const now = new Date();
  switch (dateRange) {
    case "today":
      return { gte: startOfDay(now), lte: endOfDay(now) };
    case "yesterday": {
      const y = subDays(now, 1);
      return { gte: startOfDay(y), lte: endOfDay(y) };
    }
    case "week":
      return { gte: startOfWeek(now), lte: endOfWeek(now) };
    case "month":
      return { gte: startOfMonth(now), lte: endOfMonth(now) };
    default:
      return undefined;
  }
}

function buildActivityOrderBy(
  sortColumn: ActivitySortColumn = "date",
  sortDirection: ActivitySortDirection = "desc"
) {
  const direction = sortDirection === "asc" ? ("asc" as const) : ("desc" as const);

  switch (sortColumn) {
    case "activity":
      return { activity: direction };
    case "status":
      return { status: { name: direction } };
    case "remarks":
      return { remarks: direction };
    case "time":
    case "date":
    default:
      return { createdAt: direction };
  }
}

export async function getActivities(
  filters: ActivityFilters = {}
): Promise<{ activities: ActivityWithRelations[]; total: number }> {
  noStore();

  const {
    search = "",
    statusId,
    dateRange = "all",
    startDate,
    endDate,
    sortColumn = "date",
    sortDirection = "desc",
    page = 1,
    limit = 10,
  } = filters;

  const where: Record<string, unknown> = {};

  const dateFilter = buildDateFilter(dateRange, startDate, endDate);
  if (dateFilter) {
    where.createdAt = dateFilter;
  }

  if (statusId) {
    where.statusId = statusId;
  }

  if (search) {
    where.OR = [
      { activity: { contains: search, mode: "insensitive" } },
      { remarks: { contains: search, mode: "insensitive" } },
      { status: { name: { contains: search, mode: "insensitive" } } },
    ];
  }

  const orderBy = buildActivityOrderBy(sortColumn, sortDirection);

  const [activities, total] = await Promise.all([
    prisma.activity.findMany({
      where,
      include: {
        employee: {
          select: {
            id: true,
            name: true,
            position: true,
            email: true,
            avatar: true,
          },
        },
        status: { select: { id: true, name: true, color: true } },
      },
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.activity.count({ where }),
  ]);

  return { activities, total };
}

export async function getTodayActivities(): Promise<ActivityWithRelations[]> {
  const { activities } = await getActivities({
    dateRange: "today",
    limit: 100,
    sortColumn: "date",
    sortDirection: "desc",
  });
  return activities;
}

export async function getGuestActivities(
  lookup: GuestDateLookup
): Promise<ActivityWithRelations[]> {
  const dateRange =
    lookup.preset === "custom" ? "custom" : lookup.preset;

  const { activities } = await getActivities({
    dateRange,
    startDate: lookup.startDate,
    endDate: lookup.endDate,
    limit: 500,
    sortColumn: "date",
    sortDirection: "desc",
  });

  return activities;
}

export async function getPrimaryEmployee() {
  return prisma.employee.findFirst({
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      name: true,
      position: true,
      email: true,
      avatar: true,
    },
  });
}

export async function createActivity(formData: FormData) {
  const session = await requireAuth();

  const raw = {
    activity: formData.get("activity") as string,
    statusId: formData.get("statusId") as string,
    remarks: (formData.get("remarks") as string) ?? "",
    activityDate: formData.get("activityDate") as string,
    activityTime: formData.get("activityTime") as string,
  };

  const parsed = activitySchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  let createdAt: Date;
  try {
    createdAt = parseActivityDateTime(parsed.data.activityDate, parsed.data.activityTime);
  } catch {
    return { success: false, error: "Invalid date or time" };
  }

  const activity = await prisma.activity.create({
    data: {
      activity: parsed.data.activity,
      statusId: parsed.data.statusId,
      remarks: parsed.data.remarks,
      employeeId: session.user.id,
      createdAt,
    },
    include: {
      employee: {
        select: {
          id: true,
          name: true,
          position: true,
          email: true,
          avatar: true,
        },
      },
      status: { select: { id: true, name: true, color: true } },
    },
  });

  revalidatePath("/");
  revalidatePath("/dashboard");
  revalidatePath("/activities");

  return { success: true, data: activity };
}

export async function updateActivity(id: string, formData: FormData) {
  await requireAuth();

  const raw = {
    activity: formData.get("activity") as string,
    statusId: formData.get("statusId") as string,
    remarks: (formData.get("remarks") as string) ?? "",
    activityDate: formData.get("activityDate") as string,
    activityTime: formData.get("activityTime") as string,
  };

  const parsed = activitySchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  let createdAt: Date;
  try {
    createdAt = parseActivityDateTime(parsed.data.activityDate, parsed.data.activityTime);
  } catch {
    return { success: false, error: "Invalid date or time" };
  }

  const activity = await prisma.activity.update({
    where: { id },
    data: {
      activity: parsed.data.activity,
      statusId: parsed.data.statusId,
      remarks: parsed.data.remarks,
      createdAt,
    },
    include: {
      employee: {
        select: {
          id: true,
          name: true,
          position: true,
          email: true,
          avatar: true,
        },
      },
      status: { select: { id: true, name: true, color: true } },
    },
  });

  revalidatePath("/");
  revalidatePath("/dashboard");
  revalidatePath("/activities");

  return { success: true, data: activity };
}

export async function deleteActivity(id: string) {
  await requireAuth();

  const deleted = await prisma.activity.delete({ where: { id } });

  revalidatePath("/");
  revalidatePath("/dashboard");
  revalidatePath("/activities");

  return { success: true, data: deleted };
}

export async function restoreActivity(data: {
  employeeId: string;
  activity: string;
  statusId: string;
  remarks: string;
  createdAt: Date;
}) {
  await requireAuth();

  const restored = await prisma.activity.create({
    data: {
      employeeId: data.employeeId,
      activity: data.activity,
      statusId: data.statusId,
      remarks: data.remarks,
      createdAt: data.createdAt,
    },
  });

  revalidatePath("/");
  revalidatePath("/dashboard");
  revalidatePath("/activities");

  return { success: true, data: restored };
}

export async function getDashboardStats() {
  await requireAuth();

  const now = new Date();
  const todayStart = startOfDay(now);
  const todayEnd = endOfDay(now);

  const todayActivities = await prisma.activity.findMany({
    where: { createdAt: { gte: todayStart, lte: todayEnd } },
    include: {
      employee: {
        select: {
          id: true,
          name: true,
          position: true,
          email: true,
          avatar: true,
        },
      },
      status: { select: { id: true, name: true, color: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const statuses = await prisma.status.findMany();
  const statusMap = Object.fromEntries(statuses.map((s) => [s.name.toLowerCase(), s]));

  const completed =
    todayActivities.filter(
      (a) => a.status.name.toLowerCase() === "completed"
    ).length;
  const pending =
    todayActivities.filter((a) => a.status.name.toLowerCase() === "pending")
      .length;
  const ongoing =
    todayActivities.filter((a) => a.status.name.toLowerCase() === "ongoing")
      .length;

  const completionPercentage =
    todayActivities.length > 0
      ? Math.round((completed / todayActivities.length) * 100)
      : 0;

  const sevenDaysAgo = subDays(now, 6);
  const weekActivities = await prisma.activity.findMany({
    where: { createdAt: { gte: startOfDay(sevenDaysAgo), lte: todayEnd } },
    select: { createdAt: true },
  });

  const dailyCounts: { date: string; count: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const day = subDays(now, i);
    const dayStr = day.toISOString().split("T")[0];
    const count = weekActivities.filter(
      (a) => a.createdAt.toISOString().split("T")[0] === dayStr
    ).length;
    dailyCounts.push({
      date: day.toLocaleDateString("en-US", { weekday: "short" }),
      count,
    });
  }

  const statusBreakdown = statuses.map((s) => ({
    name: s.name,
    color: s.color,
    value: todayActivities.filter((a) => a.statusId === s.id).length,
  }));

  return {
    todayTotal: todayActivities.length,
    completed,
    pending,
    ongoing,
    completionPercentage,
    recentActivities: todayActivities.slice(0, 5),
    dailyCounts,
    statusBreakdown,
  };
}
