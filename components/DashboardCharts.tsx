"use client";

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTheme } from "@/components/ThemeProvider";
import { ADMIN_CHART_COLORS, ADMIN_DARK_CHART_COLORS } from "@/lib/admin-theme";
import { cn } from "@/lib/utils";
import type { DashboardStats } from "@/types";

interface DashboardChartsProps {
  stats: DashboardStats;
}

export function DashboardCharts({ stats }: DashboardChartsProps) {
  const { theme, mounted } = useTheme();
  const isDark = mounted && theme === "dark";

  const pieData = stats.statusBreakdown.filter((s) => s.value > 0);
  const fallback = [{ name: "No Data", value: 1, color: isDark ? "#888888" : "#94a3b8" }];
  const chartData = pieData.length ? pieData : fallback;

  const pieColors = isDark
    ? chartData.map(
        (_, index) => ADMIN_DARK_CHART_COLORS[index % ADMIN_DARK_CHART_COLORS.length]
      )
    : chartData.map(
        (entry, index) =>
          entry.color ?? ADMIN_CHART_COLORS[index % ADMIN_CHART_COLORS.length]
      );

  const gridStroke = isDark ? "rgba(255,255,255,0.15)" : "rgba(79,70,229,0.12)";
  const axisStroke = isDark ? "#ffffff" : "#4338ca";
  const lineStroke = isDark ? "#ffffff" : "#4f46e5";

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Completion Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={4}
                  dataKey="value"
                  nameKey="name"
                  stroke={isDark ? "#ffffff" : "#ffffff"}
                >
                  {chartData.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={pieColors[index % pieColors.length]}
                      stroke={isDark ? "#000000" : "#ffffff"}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Activities per Day</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stats.dailyCounts}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
                <XAxis dataKey="date" stroke={axisStroke} fontSize={12} />
                <YAxis stroke={axisStroke} fontSize={12} allowDecimals={false} />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke={lineStroke}
                  strokeWidth={2}
                  dot={{ fill: lineStroke, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Daily Productivity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between text-base">
              <span className="font-semibold">Completion Rate</span>
              <span className="text-xl font-bold text-indigo-700 dark:text-white">
                {stats.completionPercentage}%
              </span>
            </div>
            <div className="h-4 overflow-hidden rounded-full border-2 border-indigo-100 dark:border-white/20">
              <div
                className={cn(
                  "h-full rounded-full transition-all duration-1000",
                  isDark ? "bg-white" : "bg-gradient-to-r from-indigo-600 to-violet-600"
                )}
                style={{ width: `${stats.completionPercentage}%` }}
              />
            </div>
            <p className="admin-muted text-base">
              {stats.completed} of {stats.todayTotal} activities completed today
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
