import { Header } from "@/components/Header";
import { StatsCard } from "@/components/StatsCard";
import { DashboardCharts } from "@/components/DashboardCharts";
import { ActivityTable } from "@/components/ActivityTable";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getDashboardStats } from "@/actions/activity";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const stats = await getDashboardStats();

  return (
    <>
      <Header
        title="Dashboard"
        subtitle="Overview of today's work itinerary"
        breadcrumbs={[{ label: "Admin" }, { label: "Dashboard" }]}
      />

      <div className="space-y-6 p-6">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatsCard
            title="Today's Activities"
            value={stats.todayTotal}
            icon="list-todo"
          />
          <StatsCard
            title="Completed"
            value={stats.completed}
            icon="completed"
          />
          <StatsCard
            title="Pending"
            value={stats.pending}
            icon="pending"
          />
          <StatsCard
            title="Ongoing"
            value={stats.ongoing}
            icon="ongoing"
          />
        </div>

        <DashboardCharts stats={stats} />

        <Card>
          <CardHeader>
            <CardTitle>Recent Activities</CardTitle>
          </CardHeader>
          <CardContent>
            <ActivityTable activities={stats.recentActivities} />
          </CardContent>
        </Card>
      </div>
    </>
  );
}
