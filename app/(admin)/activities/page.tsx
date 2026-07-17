import { Suspense } from "react";
import { ActivitiesClient } from "@/components/ActivitiesClient";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { getActivities } from "@/actions/activity";
import { getStatuses } from "@/actions/status";

export const dynamic = "force-dynamic";

export default async function ActivitiesPage() {
  const [{ activities, total }, statuses] = await Promise.all([
    getActivities({ limit: 10, sortColumn: "date", sortDirection: "desc" }),
    getStatuses(),
  ]);

  return (
    <Suspense fallback={<LoadingSpinner className="min-h-[50vh]" />}>
      <ActivitiesClient
        initialActivities={activities}
        initialTotal={total}
        statuses={statuses}
      />
    </Suspense>
  );
}
