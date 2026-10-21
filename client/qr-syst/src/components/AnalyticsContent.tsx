
"use client";

import { useEffect, useState } from "react";
import { apiRequest } from "@/lib/api";
import DailyScansChart from "@/components/DailyScansChart";

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

interface AdminResponse {
  success: boolean;
  admin: {
    id: string;
    email: string;
    role: string;
  };
}

export default function AnalyticsContent() {
  const [analytics, setAnalytics] =
    useState<AnalyticsSummary | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadAnalytics() {
      try {
 
        await apiRequest<AdminResponse>("/api/auth/me");

        const response =
          await apiRequest<AnalyticsResponse>(
            "/api/analytics/summary"
          );

        setAnalytics(response.data);
      } catch {
        window.location.replace("/login");
      } finally {
        setLoading(false);
      }
    }

    loadAnalytics();
  }, []);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-slate-600">
          Loading analytics...
        </p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="p-8">
        <p role="alert" className="text-red-700">
          {error}
        </p>
      </main>
    );
  }

  if (!analytics) {
    return null;
  }

  const deviceStats = [
    {
      title: "iOS",
      count: analytics.iosScans,
    },
    {
      title: "Android",
      count: analytics.androidScans,
    },
    {
      title: "Other Devices",
      count: analytics.otherScans,
    },
  ];

  return (
    <main className="min-h-screen bg-slate-100 p-6 md:p-10">
      <div className="mx-auto max-w-7xl">
        <header className="mb-8">
          <p className="text-sm font-medium text-blue-600">
            REPORTS
          </p>

          <h1 className="mt-2 text-3xl font-bold text-slate-900">
            Analytics
          </h1>

          <p className="mt-2 text-slate-600">
            Review QR scan activity and device statistics.
          </p>
        </header>

        <section className="grid gap-5 sm:grid-cols-2">
          <article className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-slate-500">
              Total Scans
            </p>

            <p className="mt-3 text-3xl font-bold text-slate-900">
              {analytics.totalScans}
            </p>
          </article>

          <article className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-slate-500">
              Device Categories
            </p>

            <p className="mt-3 text-3xl font-bold text-slate-900">
              {deviceStats.length}
            </p>

            <p className="mt-2 text-sm text-slate-500">
              iOS, Android, and other devices
            </p>
          </article>
        </section>

        <section className="mt-8 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">
            Scans by Device
          </h2>

          <div className="mt-5 space-y-5">
            {deviceStats.map((device) => {
              const percentage =
                analytics.totalScans > 0
                  ? (device.count / analytics.totalScans) * 100
                  : 0;

              return (
                <div key={device.title}>
                  <div className="mb-2 flex items-center justify-between gap-4">
                    <span className="font-medium text-slate-700">
                      {device.title}
                    </span>

                    <span className="text-sm text-slate-600">
                      {device.count} scans (
                      {percentage.toFixed(1)}%)
                    </span>
                  </div>

                  <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-blue-600"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <DailyScansChart
          dailyScans={analytics.dailyScans ?? []}
        />

        <div className="mt-8">
          <a
            href="/"
            className="font-medium text-blue-600 hover:text-blue-800"
          >
            ← Back to Dashboard
          </a>
        </div>
      </div>
    </main>
  );
}
