
const stats = [
  {
    title: "Total Scans",
    value: "1,284",
    description: "All QR codes combined",
  },
  {
    title: "iOS Scans",
    value: "742",
    description: "Apple devices",
  },
  {
    title: "Android Scans",
    value: "491",
    description: "Android devices",
  },
  {
    title: "Other Devices",
    value: "51",
    description: "Other or unidentified",
  },
];

export default function DashboardPage() {
  return (
    <main className="min-h-screen bg-slate-100 text-slate-900">
      <div className="flex min-h-screen">
        
        <aside className="hidden w-64 shrink-0 bg-slate-950 p-6 text-white md:block">
          <h1 className="text-2xl font-bold">QR Analytics</h1>

          <p className="mt-2 text-sm text-slate-400">
            Management Dashboard
          </p>

          <nav className="mt-10 space-y-2">
            <a
              href="/"
              className="block rounded-lg bg-blue-600 px-4 py-3 font-medium"
            >
              Dashboard
            </a>

            <a
              href="/qrcode"
              className="block rounded-lg px-4 py-3 text-slate-300 hover:bg-slate-800"
            >
              QR Codes
            </a>

            <a
              href="/analytics"
              className="block rounded-lg px-4 py-3 text-slate-300 hover:bg-slate-800"
            >
              Analytics
            </a>
          </nav>
        </aside>

      
        <section className="min-w-0 flex-1 p-5 sm:p-8">
          <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600">
                OVERVIEW
              </p>

              <h2 className="mt-1 text-3xl font-bold">
                Dashboard
              </h2>

              <p className="mt-2 text-slate-500">
                Monitor your QR code performance.
              </p>
            </div>

            <span className="w-fit rounded-full bg-white px-4 py-2 text-sm text-slate-600 shadow-sm">
              Admin Panel
            </span>
          </header>

          <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {stats.map((stat) => (
              <article
                key={stat.title}
                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
              >
                <p className="text-sm font-medium text-slate-500">
                  {stat.title}
                </p>

                <p className="mt-3 text-3xl font-bold tracking-tight">
                  {stat.value}
                </p>

                <p className="mt-2 text-sm text-slate-500">
                  {stat.description}
                </p>
              </article>
            ))}
          </div>

          <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-xl font-semibold">
              Your QR system
            </h3>

            <p className="mt-2 leading-7 text-slate-600">
              Manage your QR codes, direct visitors to the correct
              app store, and understand how people interact with
              your codes.
            </p>

            <div className="mt-5 rounded-xl bg-blue-50 p-4 text-sm leading-6 text-blue-900">
              These numbers are sample data for the first UI lesson.
              We will connect the dashboard to your real analytics API
              in a later step.
            </div>
          </section>
        </section>
      </div>
    </main>
  );
}
