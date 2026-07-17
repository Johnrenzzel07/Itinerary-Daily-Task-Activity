import { StatusManager } from "@/components/StatusManager";
import { getStatuses } from "@/actions/status";

export const dynamic = "force-dynamic";

export default async function StatusPage() {
  const statuses = await getStatuses();
  return <StatusManager initialStatuses={statuses} />;
}
