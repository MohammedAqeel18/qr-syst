
import Link from "next/link";

const statistics = [
  {
    title: "Total Scans",
    value: "—",
    description: "All QR code scans",
  },
  {
    title: "iOS Scans",
    value: "—",
    description: "Scans from Apple devices",
  },
  {
    title: "Android Scans",
    value: "—",
    description: "Scans from Android devices",
  },
  {
    title: "Other Devices",
    value: "—",
    description: "Scans from other devices",
  },
];

export default function DashboardContent() {
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
            href="/qrcodes"
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
                {statistic.value}
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
