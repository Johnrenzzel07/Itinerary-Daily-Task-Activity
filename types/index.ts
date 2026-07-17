export type ActivityWithRelations = {
  id: string;
  employeeId: string;
  activity: string;
  statusId: string;
  remarks: string;
  createdAt: Date;
  updatedAt: Date;
  employee: {
    id: string;
    name: string;
    position: string;
    email: string;
    avatar: string | null;
  };
  status: {
    id: string;
    name: string;
    color: string;
  };
};

export type StatusItem = {
  id: string;
  name: string;
  color: string;
};

export type ActivitySortColumn = "date" | "time" | "activity" | "status" | "remarks";

export type ActivitySortDirection = "asc" | "desc";

export type ActivityFilters = {
  search?: string;
  statusId?: string;
  dateRange?: "today" | "yesterday" | "week" | "month" | "all" | "custom";
  startDate?: string;
  endDate?: string;
  sortColumn?: ActivitySortColumn;
  sortDirection?: ActivitySortDirection;
  page?: number;
  limit?: number;
};

export type GuestDatePreset =
  | "today"
  | "yesterday"
  | "week"
  | "month"
  | "all"
  | "custom";

export type GuestDateLookup = {
  preset: GuestDatePreset;
  startDate?: string;
  endDate?: string;
};

export type DashboardStats = {
  todayTotal: number;
  completed: number;
  pending: number;
  ongoing: number;
  completionPercentage: number;
  recentActivities: ActivityWithRelations[];
  dailyCounts: { date: string; count: number }[];
  statusBreakdown: { name: string; value: number; color: string }[];
};

export type EmployeeProfile = {
  id: string;
  name: string;
  position: string;
  email: string;
  avatar: string | null;
};
