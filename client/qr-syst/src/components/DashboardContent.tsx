
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiRequest } from "@/lib/api";
import DailyScansChart from "./DailyScansChart";
import AdminLayout from "@/components/AdminLayout";

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

export default function DashboardContent() {
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
        setError(
          "Unable to load analytics. Please refresh or sign in again."
        );
      } finally {
        setLoading(false);
      }
    }

    loadAnalytics();
  }, []);

  const statistics = [
    {
      title: "Total Scans",
      value: analytics?.totalScans,
      description: "All QR code scans",
    },
    {
      title: "iOS Scans",
      value: analytics?.iosScans,
      description: "Scans from Apple devices",
    },
    {
      title: "Android Scans",
      value: analytics?.androidScans,
      description: "Scans from Android devices",
    },
    {
      title: "Other Devices",
      value: analytics?.otherScans,
      description: "Scans from other devices",
    },
  ];

  return (
    <AdminLayout>
      <main className="min-w-0 flex-1 p-6 md:p-10">
        <header className="mb-8">
          <p className="text-sm font-medium text-blue-600">
            OVERVIEW
          </p>

          <h2 className="mt-2 text-3xl font-bold text-slate-900 dark:text-slate-100">
            Dashboard
          </h2>

          <p className="mt-2 text-slate-600 dark:text-slate-400">
            Monitor your QR codes and scan activity.
          </p>
        </header>

        {loading && (
          <p className="mb-6 text-slate-600 dark:text-slate-400">
            Loading analytics...
          </p>
        )}

        {error && (
          <p
            role="alert"
            className="mb-6 rounded-lg bg-red-50 p-4 text-red-700 dark:bg-red-950 dark:text-red-200"
          >
            {error}
          </p>
        )}

        <section
          aria-label="Scan statistics"
          className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4"
        >
          {statistics.map((statistic) => (
            <article
              key={statistic.title}
              className=" border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900"
            >
              <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400">
                {statistic.title}
              </h3>

              <p className="mt-3 text-3xl font-bold text-slate-900 dark:text-slate-100">
                {statistic.value ?? "—"}
              </p>

              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                {statistic.description}
              </p>
            </article>
          ))}
        </section>

        <section className="mt-8  border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            Quick Actions
          </h3>

          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            Manage your QR codes or review their analytics.
          </p>

          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              href="/qr-codes"
              className=" bg-blue-600 px-5 py-3 font-medium text-white transition hover:bg-blue-700"
            >
              Manage QR Codes
            </Link>

            <Link
              href="/analytics"
              className=" border border-slate-300 px-5 py-3 font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              View Analytics
            </Link>
          </div>

          <div className="mt-6">
            <DailyScansChart
              dailyScans={analytics?.dailyScans ?? []}
            />
          </div>
        </section>
      </main>
    </AdminLayout>
  );
}
