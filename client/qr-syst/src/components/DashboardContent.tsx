
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiRequest } from "@/lib/api";

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
    <div className="min-h-screen bg-slate-100 md:flex">
      <aside className="w-full bg-slate-900 p-6 text-white md:min-h-screen md:w-64">
        <h1 className="text-2xl font-bold">QR Analytics</h1>

        <p className="mt-2 text-sm text-slate-400">
          Administrator Panel
        </p>

        <nav className="mt-8 space-y-2">
          <Link
            href="/"
            className="block rounded-lg bg-blue-600 px-4 py-3"
          >
            Dashboard
          </Link>

          <Link
            href="/qr-codes"
            className="block rounded-lg px-4 py-3 hover:bg-slate-800"
          >
            QR Codes
          </Link>

          <Link
            href="/analytics"
            className="block rounded-lg px-4 py-3 hover:bg-slate-800"
          >
            Analytics
          </Link>
        </nav>
      </aside>

      <main className="min-w-0 flex-1 p-6 md:p-10">
        <header className="mb-8">
          <p className="text-sm font-medium text-blue-600">
            OVERVIEW
          </p>

          <h2 className="mt-2 text-3xl font-bold text-slate-900">
            Dashboard
          </h2>

          <p className="mt-2 text-slate-600">
            Monitor your QR codes and scan activity.
          </p>
        </header>

        {loading && (
          <p className="mb-6 text-slate-600">
            Loading analytics...
          </p>
        )}

        {error && (
          <p
            role="alert"
            className="mb-6 rounded-lg bg-red-50 p-4 text-red-700"
          >
            {error}
          </p>
        )}

        <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {statistics.map((statistic) => (
            <article
              key={statistic.title}
              className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <h3 className="text-sm font-medium text-slate-500">
                {statistic.title}
              </h3>

              <p className="mt-3 text-3xl font-bold text-slate-900">
                {statistic.value ?? "—"}
              </p>

              <p className="mt-2 text-sm text-slate-500">
                {statistic.description}
              </p>
            </article>
          ))}
        </section>

        <section className="mt-8 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900">
            Quick Actions
          </h3>

          <p className="mt-2 text-sm text-slate-600">
            Manage your QR codes or review their analytics.
          </p>

          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              href="/qr-codes"
              className="rounded-lg bg-blue-600 px-5 py-3 font-medium text-white hover:bg-blue-700"
            >
              Manage QR Codes
            </Link>

            <Link
              href="/analytics"
              className="rounded-lg border border-slate-300 px-5 py-3 font-medium text-slate-700 hover:bg-slate-50"
            >
              View Analytics
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
