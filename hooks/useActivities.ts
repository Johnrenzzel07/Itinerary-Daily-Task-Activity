"use client";

import { useCallback, useState, useTransition } from "react";
import { getActivities } from "@/actions/activity";
import type { ActivityFilters, ActivityWithRelations } from "@/types";

export function useActivities(initialFilters: ActivityFilters = {}) {
  const [activities, setActivities] = useState<ActivityWithRelations[]>([]);
  const [total, setTotal] = useState(0);
  const [isPending, startTransition] = useTransition();

  const load = useCallback(
    (filters: ActivityFilters = initialFilters) => {
      startTransition(async () => {
        const result = await getActivities(filters);
        setActivities(result.activities);
        setTotal(result.total);
      });
    },
    [initialFilters]
  );

  return { activities, total, isPending, load };
}
