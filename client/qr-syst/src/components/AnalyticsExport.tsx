
"use client";

import { useState } from "react";



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



function getDefaultDates() {
  const today = new Date();


  const endDate = getQatarDateString(today);


  const end = new Date(`${endDate}T00:00:00.000Z`);

  const start = new Date(end);


  start.setUTCDate(start.getUTCDate() - 6);

  return {
    startDate: start.toISOString().slice(0, 10),
    endDate,
  };
}



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


  const start = new Date(`${startDate}T00:00:00.000Z`);

  const end = new Date(`${endDate}T00:00:00.000Z`);

  const dayDifference =
    (end.getTime() - start.getTime()) / 86400000;


  const invalidDates =
    !startDate ||
    !endDate ||
    Number.isNaN(start.getTime()) ||
    Number.isNaN(end.getTime()) ||
    dayDifference < 0 ||
    dayDifference > 365;



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


      const params = new URLSearchParams({
        startDate,
        endDate,
      });

   
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

    
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);

        throw new Error(
          errorData?.message ||
            `Unable to download report. Status: ${response.status}`
        );
      }

      
      const blob = await response.blob();

      if (blob.size === 0) {
        throw new Error("The downloaded report is empty.");
      }

   
      const downloadUrl = window.URL.createObjectURL(blob);


      const link = document.createElement("a");

      link.href = downloadUrl;

      link.download =
        `qr-analytics-${startDate}-to-${endDate}.csv`;

      document.body.appendChild(link);

      link.click();

      document.body.removeChild(link);

   
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



  return (
    <section className="mt-8  border border-slate-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-[#111113] sm:p-6">



      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3">

          <div className="flex h-10 w-10 items-center justify-center  bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
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



      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">


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
            className="w-full  border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
          />
        </div>



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
            className="w-full  border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
          />
        </div>

      </div>



      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

        <p className="text-xs text-slate-500 dark:text-zinc-400">
          Maximum reporting period: 366 days.
        </p>

        <button
          type="button"
          onClick={handleDownload}
          disabled={downloading || invalidDates}
          className="inline-flex items-center justify-center gap-2  bg-slate-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white dark:text-slate-900 dark:hover:bg-zinc-200"
        >
          {downloading ? (
            <>
              <span className="h-4 w-4 animate-spin  border-2 border-current border-t-transparent" />

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



      {error && (
        <p
          role="alert"
          className="mt-4  bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-500/10 dark:text-red-400"
        >
          {error}
        </p>
      )}



      {success && (
        <p
          role="status"
          className="mt-4 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400"
        >
          {success}
        </p>
      )}

    </section>
  );
}
