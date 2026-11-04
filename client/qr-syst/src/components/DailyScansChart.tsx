"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface DailyScan {
  date: string;
  count: number;
}

interface DailyScansChartProps {
  dailyScans: DailyScan[];
}

export default function DailyScansChart({
  dailyScans,
}: DailyScansChartProps) {
  const chartData = dailyScans
    .map((scan) => {
      const date = scan.date.slice(0, 10);
      const parsedDate = new Date(`${date}T00:00:00`);

      return {
        ...scan,
        date,
        dateLabel: parsedDate.toLocaleDateString("en", {
          month: "short",
          day: "numeric",
        }),
        fullDate: parsedDate.toLocaleDateString("en", {
          weekday: "long",
          month: "long",
          day: "numeric",
          year: "numeric",
        }),
      };
    })
    .sort((a, b) => a.date.localeCompare(b.date));

  if (chartData.length === 0) {
    return (
      <div className="flex min-h-[280px] flex-col items-center justify-center rounded-lg border border-dashed border-slate-200 bg-slate-50/70 px-6 text-center dark:border-zinc-800 dark:bg-zinc-900/40">
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-100 text-slate-500 dark:bg-zinc-800 dark:text-zinc-400">
          <svg
            width="21"
            height="21"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M3 3v18h18" />
            <path d="m7 14 4-4 4 4 6-7" />
          </svg>
        </div>

        <p className="mt-4 text-sm font-semibold text-slate-700 dark:text-zinc-300">
          No scan activity yet
        </p>

        <p className="mt-1 max-w-sm text-xs leading-5 text-slate-500 dark:text-zinc-500">
          Daily scan activity will appear here after
          your QR codes receive scans.
        </p>
      </div>
    );
  }

  const maximumCount = Math.max(
    ...chartData.map((item) => item.count),
    1
  );

  const yAxisMaximum = Math.max(4, Math.ceil(maximumCount * 1.25));

  return (
    <div className="w-full">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-blue-500" />

          <span className="text-xs font-medium text-slate-600 dark:text-zinc-300">
            Recorded scans
          </span>
        </div>

        <p className="text-xs text-slate-400 dark:text-zinc-500">
          {chartData.length}{" "}
          {chartData.length === 1 ? "recorded date" : "recorded dates"}
        </p>
      </div>

      <div className="h-[280px] w-full sm:h-[320px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{
              top: 15,
              right: 18,
              left: -12,
              bottom: 5,
            }}
          >
            <CartesianGrid
              stroke="var(--analytics-grid)"
              strokeDasharray="3 5"
              vertical={false}
            />

            <XAxis
              dataKey="dateLabel"
              axisLine={false}
              tickLine={false}
              tick={{
                fill: "var(--analytics-text)",
                fontSize: 12,
              }}
              tickMargin={14}
              minTickGap={25}
            />

            <YAxis
              domain={[0, yAxisMaximum]}
              allowDecimals={false}
              axisLine={false}
              tickLine={false}
              tick={{
                fill: "var(--analytics-text)",
                fontSize: 12,
              }}
              width={40}
              tickMargin={10}
            />

            <Tooltip
              cursor={{
                stroke: "var(--analytics-cursor)",
                strokeDasharray: "4 4",
              }}
              content={({ active, payload }) => {
                if (!active || !payload || payload.length === 0) {
                  return null;
                }

                const point = payload[0].payload as {
                  fullDate: string;
                  count: number;
                };

                return (
                  <div className="min-w-[155px] rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-xl dark:border-zinc-700 dark:bg-[#202024]">
                    <p className="text-xs text-slate-500 dark:text-zinc-400">
                      {point.fullDate}
                    </p>

                    <p className="mt-2 text-2xl font-semibold tabular-nums text-slate-950 dark:text-white">
                      {point.count.toLocaleString()}
                    </p>

                    <p className="mt-0.5 text-xs text-slate-500 dark:text-zinc-400">
                      {point.count === 1 ? "Scan" : "Scans"}
                    </p>
                  </div>
                );
              }}
            />

            <Line
              type="monotone"
              dataKey="count"
              name="Scans"
              stroke="#3b82f6"
              strokeWidth={3}
              dot={{
                r: chartData.length === 1 ? 6 : 4,
                fill: "#3b82f6",
                stroke: "var(--analytics-dot-border)",
                strokeWidth: 2,
              }}
              activeDot={{
                r: 7,
                fill: "#3b82f6",
                stroke: "var(--analytics-dot-border)",
                strokeWidth: 3,
              }}
              animationDuration={700}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}