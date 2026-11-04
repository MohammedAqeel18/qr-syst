"use client";

import { useEffect, useState } from "react";
import { apiRequest } from "@/lib/api";
import DailyScansChart from "@/components/DailyScansChart";
import AnalyticsExport from "@/components/AnalyticsExport";

import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

interface AnalyticsSummary {
  totalScans: number;
  iosScans: number;
  androidScans: number;
  otherScans: number;
  dailyScans: {
    date: string;
    count: number;
  }[];
}

interface AnalyticsResponse {
  success: boolean;
  data: AnalyticsSummary;
}

const deviceColors = ["#3b82f6", "#10b981", "#a78bfa"];

export default function AnalyticsContent() {
  const [analytics, setAnalytics] =
    useState<AnalyticsSummary | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadAnalytics() {
      try {
        const response =
          await apiRequest<AnalyticsResponse>(
            "/api/analytics/summary"
          );

        setAnalytics(response.data);
      } catch {
        setError("Unable to load analytics data.");
      } finally {
        setLoading(false);
      }
    }

    loadAnalytics();
  }, []);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-[#09090b]">
        <p className="text-sm text-slate-500 dark:text-zinc-400">
          Loading analytics...
        </p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-slate-50 p-8 dark:bg-[#09090b]">
        <p className="text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      </main>
    );
  }

  if (!analytics) return null;

  const stats = [
    {
      title: "Total scans",
      value: analytics.totalScans,
      description: "All recorded QR scans",
      color: "bg-blue-500",
      lightColor: "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400",
      initial: "T",
    },
    {
      title: "iOS scans",
      value: analytics.iosScans,
      description: "Apple devices",
      color: "bg-blue-500",
      lightColor: "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400",
      initial: "i",
    },
    {
      title: "Android scans",
      value: analytics.androidScans,
      description: "Android devices",
      color: "bg-emerald-500",
      lightColor: "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400",
      initial: "A",
    },
    {
      title: "Other devices",
      value: analytics.otherScans,
      description: "Other or unidentified devices",
      color: "bg-violet-500",
      lightColor: "bg-violet-50 text-violet-600 dark:bg-violet-500/10 dark:text-violet-400",
      initial: "O",
    },
  ];

  const deviceStats = [
    { name: "iOS", count: analytics.iosScans },
    { name: "Android", count: analytics.androidScans },
    { name: "Other devices", count: analytics.otherScans },
  ];

  const chartDeviceStats = deviceStats.filter(
    (device) => device.count > 0
  );

  const totalDeviceScans = deviceStats.reduce(
    (total, device) => total + device.count,
    0
  );

  return (
    <main className="min-h-screen bg-slate-50 px-5 py-8 text-slate-900 transition-colors dark:bg-[#09090b] dark:text-zinc-100 sm:px-8">
      <div className="mx-auto max-w-7xl">

        {/* Page heading */}
        <header className="mb-8 flex flex-col justify-between gap-4 border-b border-slate-200 pb-7 dark:border-zinc-800 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-600 dark:text-blue-400">
              Reports and insights
            </p>

            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950 dark:text-white">
              Analytics
            </h1>

            <p className="mt-2 max-w-xl text-sm text-slate-500 dark:text-zinc-400">
              Understand your QR code performance and see
              how your audience interacts with your codes.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start rounded-lg border border-slate-200 bg-white px-3 py-2 dark:border-zinc-800 dark:bg-[#111113] sm:self-auto">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            <span className="text-xs font-medium text-slate-600 dark:text-zinc-300">
              Live recorded data
            </span>
          </div>
        </header>

        {/* KPI overview */}
        <section>
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-slate-900 dark:text-white">
                Performance overview
              </h2>
              <p className="mt-1 text-xs text-slate-500 dark:text-zinc-500">
                Summary of all recorded QR scans
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {stats.map((stat) => (
              <article
                key={stat.title}
                className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-colors dark:border-zinc-800 dark:bg-[#111113]"
              >
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-slate-500 dark:text-zinc-400">
                    {stat.title}
                  </p>

                  <div
                    className={`flex h-9 w-9 items-center justify-center rounded-lg text-sm font-semibold ${stat.lightColor}`}
                  >
                    {stat.initial}
                  </div>
                </div>

                <p className="mt-5 text-3xl font-semibold tracking-tight tabular-nums text-slate-950 dark:text-white">
                  {stat.value.toLocaleString()}
                </p>

                <p className="mt-2 text-xs text-slate-500 dark:text-zinc-500">
                  {stat.description}
                </p>
              </article>
            ))}
          </div>
        </section>

        {/* Daily scan activity */}
        <section className="mt-8 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-[#111113]">
          <div className="flex flex-col justify-between gap-3 border-b border-slate-100 px-5 py-5 dark:border-zinc-800 sm:flex-row sm:items-center sm:px-6">
            <div>
              <h2 className="text-base font-semibold text-slate-900 dark:text-white">
                Daily scan activity
              </h2>

              <p className="mt-1 text-sm text-slate-500 dark:text-zinc-400">
                Daily volume of QR code scans.
              </p>
            </div>

            <span className="w-fit rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-600 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300">
              Daily
            </span>
          </div>

          <div className="p-5 sm:p-6">
            <DailyScansChart
              dailyScans={analytics.dailyScans ?? []}
            />
          </div>
        </section>

        {/* Device breakdown */}
        <section className="mt-8 rounded-xl border border-slate-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-[#111113]">
          <div className="border-b border-slate-100 px-5 py-5 dark:border-zinc-800 sm:px-6">
            <h2 className="text-base font-semibold text-slate-900 dark:text-white">
              Device breakdown
            </h2>

            <p className="mt-1 text-sm text-slate-500 dark:text-zinc-400">
              Distribution of scans by device category.
            </p>
          </div>

          <div className="grid grid-cols-1 items-center gap-8 p-5 sm:p-6 lg:grid-cols-2">
            {/* Donut chart */}
            <div className="relative mx-auto h-64 w-full max-w-xs">
              {totalDeviceScans > 0 ? (
                <>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={chartDeviceStats}
                        dataKey="count"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={72}
                        outerRadius={98}
                        paddingAngle={4}
                        stroke="none"
                      >
                        {chartDeviceStats.map((device) => {
                          const colorIndex = deviceStats.findIndex(
                            (item) => item.name === device.name
                          );

                          return (
                            <Cell
                              key={device.name}
                              fill={deviceColors[colorIndex]}
                            />
                          );
                        })}
                      </Pie>

                      <Tooltip
                        formatter={(value, name) => [
                          `${Number(value).toLocaleString()} scans`,
                          name,
                        ]}
                        contentStyle={{
                          backgroundColor: "var(--analytics-tooltip-bg)",
                          border: "1px solid var(--analytics-tooltip-border)",
                          borderRadius: "10px",
                          color: "var(--analytics-tooltip-text)",
                          fontSize: "12px",
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>

                  <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-xs text-slate-500 dark:text-zinc-400">
                      Total scans
                    </span>
                    <span className="mt-1 text-3xl font-semibold tabular-nums text-slate-950 dark:text-white">
                      {analytics.totalScans.toLocaleString()}
                    </span>
                  </div>
                </>
              ) : (
                <div className="flex h-full items-center justify-center rounded-full text-sm text-slate-500 dark:text-zinc-400">
                  No device data available
                </div>
              )}
            </div>

            {/* Device legend */}
            <div className="space-y-5">
              {deviceStats.map((device, index) => {
                const percentage =
                  analytics.totalScans > 0
                    ? (device.count / analytics.totalScans) * 100
                    : 0;

                return (
                  <div key={device.name}>
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <span
                          className="h-3 w-3 rounded-sm"
                          style={{
                            backgroundColor: deviceColors[index],
                          }}
                        />

                        <span className="text-sm font-medium text-slate-700 dark:text-zinc-300">
                          {device.name}
                        </span>
                      </div>

                      <div className="text-right">
                        <span className="text-sm font-semibold tabular-nums text-slate-900 dark:text-white">
                          {device.count.toLocaleString()}
                        </span>

                        <span className="ml-2 text-xs tabular-nums text-slate-400 dark:text-zinc-500">
                          {percentage.toFixed(1)}%
                        </span>
                      </div>
                    </div>

                    <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-zinc-800">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${percentage}%`,
                          backgroundColor: deviceColors[index],
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <AnalyticsExport/>
      </div>
    </main>
  );
}