
"use client";

import { useState } from "react";

// --------------------------------------------------
// Helper 1: Get today's date in Qatar
// --------------------------------------------------

function getQatarDateString(date: Date): string {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Qatar",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);

  const get = (type: string) =>
    parts.find((part) => part.type === type)?.value ?? "";

  return `${get("year")}-${get("month")}-${get("day")}`;
}

// --------------------------------------------------
// Helper 2: Calculate the default reporting period
// --------------------------------------------------

function getDefaultDates() {
  const today = new Date();

  // Get the current Qatar calendar date.
  const endDate = getQatarDateString(today);

  // Use UTC for calendar-day arithmetic only.
  const end = new Date(`${endDate}T00:00:00.000Z`);

  const start = new Date(end);

  // Default period: last seven calendar days.
  start.setUTCDate(start.getUTCDate() - 6);

  return {
    startDate: start.toISOString().slice(0, 10),
    endDate,
  };
}

// --------------------------------------------------
// Main CSV export component
// --------------------------------------------------

export default function AnalyticsExport() {
  const defaultDates = getDefaultDates();

  const [startDate, setStartDate] = useState(
    defaultDates.startDate
  );

  const [endDate, setEndDate] = useState(
    defaultDates.endDate
  );

  const [downloading, setDownloading] = useState(false);

  const [error, setError] = useState("");

  const [success, setSuccess] = useState("");

  // Calculate the selected date range.
  const start = new Date(`${startDate}T00:00:00.000Z`);

  const end = new Date(`${endDate}T00:00:00.000Z`);

  const dayDifference =
    (end.getTime() - start.getTime()) / 86400000;

  // Validate the selected dates.
  const invalidDates =
    !startDate ||
    !endDate ||
    Number.isNaN(start.getTime()) ||
    Number.isNaN(end.getTime()) ||
    dayDifference < 0 ||
    dayDifference > 365;

  // ------------------------------------------------
  // Download CSV report
  // ------------------------------------------------

  async function handleDownload() {
    setError("");
    setSuccess("");

    if (invalidDates) {
      setError(
        "Please select a valid date range (maximum 366 days)."
      );

      return;
    }

    try {
      setDownloading(true);

      // Prepare backend query parameters.
      const params = new URLSearchParams({
        startDate,
        endDate,
      });

      // Send authenticated request.
      const response = await fetch(
        `/api/analytics/export?${params.toString()}`,
        {
          method: "GET",
          credentials: "include",
          headers: {
            Accept: "text/csv",
          },
        }
      );

      // Handle backend errors.
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);

        throw new Error(
          errorData?.message ||
            `Unable to download report. Status: ${response.status}`
        );
      }

      // Convert response into a downloadable file.
      const blob = await response.blob();

      if (blob.size === 0) {
        throw new Error("The downloaded report is empty.");
      }

      // Create temporary browser URL.
      const downloadUrl = window.URL.createObjectURL(blob);

      // Create download link.
      const link = document.createElement("a");

      link.href = downloadUrl;

      link.download =
        `qr-analytics-${startDate}-to-${endDate}.csv`;

      // Start download.
      document.body.appendChild(link);

      link.click();

      document.body.removeChild(link);

      // Release temporary browser URL.
      window.setTimeout(() => {
        window.URL.revokeObjectURL(downloadUrl);
      }, 1000);

      setSuccess(
        "Your analytics report has been downloaded successfully."
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong while downloading the report."
      );
    } finally {
      setDownloading(false);
    }
  }

  // ------------------------------------------------
  // Component UI
  // ------------------------------------------------

  return (
    <section className="mt-8 rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-[#111113] sm:p-6">

      {/* Heading */}

      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3">

          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
            <span className="text-sm font-bold">
              CSV
            </span>
          </div>

          <div>
            <h2 className="text-base font-semibold text-slate-900 dark:text-white">
              Export analytics report
            </h2>

            <p className="mt-1 text-sm text-slate-500 dark:text-zinc-400">
              Download your QR scan records using Qatar local dates and times.
            </p>
          </div>

        </div>
      </div>

      {/* Date selection */}

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">

        {/* Start date */}

        <div>
          <label
            htmlFor="analytics-start-date"
            className="mb-2 block text-sm font-medium text-slate-700 dark:text-zinc-300"
          >
            Start date
          </label>

          <input
            id="analytics-start-date"
            type="date"
            value={startDate}
            max={endDate}
            onChange={(event) =>
              setStartDate(event.target.value)
            }
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
          />
        </div>

        {/* End date */}

        <div>
          <label
            htmlFor="analytics-end-date"
            className="mb-2 block text-sm font-medium text-slate-700 dark:text-zinc-300"
          >
            End date
          </label>

          <input
            id="analytics-end-date"
            type="date"
            value={endDate}
            min={startDate}
            onChange={(event) =>
              setEndDate(event.target.value)
            }
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
          />
        </div>

      </div>

      {/* Download action */}

      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

        <p className="text-xs text-slate-500 dark:text-zinc-400">
          Maximum reporting period: 366 days.
        </p>

        <button
          type="button"
          onClick={handleDownload}
          disabled={downloading || invalidDates}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white dark:text-slate-900 dark:hover:bg-zinc-200"
        >
          {downloading ? (
            <>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />

              Preparing report...
            </>
          ) : (
            <>
              <span aria-hidden="true">
                ↓
              </span>

              Download CSV report
            </>
          )}
        </button>

      </div>

      {/* Error message */}

      {error && (
        <p
          role="alert"
          className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-500/10 dark:text-red-400"
        >
          {error}
        </p>
      )}

      {/* Success message */}

      {success && (
        <p
          role="status"
          className="mt-4 rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400"
        >
          {success}
        </p>
      )}

    </section>
  );
}
