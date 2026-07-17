import { format } from "date-fns";
import { getTodayActivities, getPrimaryEmployee } from "@/actions/activity";
import { GuestView } from "@/components/GuestView";
import type { ActivityWithRelations, EmployeeProfile } from "@/types";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  let activities: ActivityWithRelations[] = [];
  let employee: EmployeeProfile | null = null;
  const todayLabel = format(new Date(), "EEEE, MMMM d, yyyy");

  try {
    [activities, employee] = await Promise.all([
      getTodayActivities(),
      getPrimaryEmployee(),
    ]);
  } catch {
    // Database may not be connected yet during initial setup
  }

  return (
    <GuestView
      initialActivities={activities}
      employee={employee}
      todayLabel={todayLabel}
    />
  );
}
