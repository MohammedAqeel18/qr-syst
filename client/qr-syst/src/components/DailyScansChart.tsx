
"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
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
  const chartData = dailyScans.map((scan) => ({
    ...scan,
    dateLabel: new Date(
      `${scan.date.slice(0, 10)}T00:00:00`
    ).toLocaleDateString("en", {
      month: "short",
      day: "numeric",
    }),
  }));

  if (dailyScans.length === 0) {
    return (
      <section className="mt-8 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-slate-900">
          Daily Scan Activity
        </h3>

        <p className="mt-4 text-sm text-slate-500">
          No daily scan data is available yet.
        </p>
      </section>
    );
  }

  return (
    <section className="mt-8  border border-slate-200 bg-white p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-slate-900">
        Daily Scan Activity
      </h3>

      <p className="mt-2 text-sm text-slate-500">
        Number of QR code scans per day.
      </p>

      <div className="mt-6 h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{
              top: 10,
              right: 10,
              left: 0,
              bottom: 5,
            }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
            />

            <XAxis
              dataKey="dateLabel"
              tick={{ fontSize: 12 }}
            />

            <YAxis
              allowDecimals={false}
              width={40}
            />

            <Tooltip />

            <Bar
              dataKey="count"
              name="Scans"
              fill="#2563eb"
              barSize={220}
              radius={[0, 0, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
