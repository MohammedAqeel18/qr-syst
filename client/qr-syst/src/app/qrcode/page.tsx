
const qrCodes = [
  {
    id: "a81f2c903b7d4e6f9012abcd345678ef",
    name: "Main App Download",
    destination: "Apple App Store + Google Play",
    scans: 842,
    status: "Active",
  },
  {
    id: "b92e3d014c8f5a6b0123bcde456789fa",
    name: "Office Poster",
    destination: "Apple App Store + Google Play",
    scans: 316,
    status: "Active",
  },
  {
    id: "c03f4e125d9a6b7c1234cdef567890ab",
    name: "Old Campaign",
    destination: "Apple App Store + Google Play",
    scans: 126,
    status: "Inactive",
  },
];

export default function QRCodesPage() {
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
              className="block rounded-lg px-4 py-3 text-slate-300 hover:bg-slate-800"
            >
              Dashboard
            </a>

            <a
              href="/qr-codes"
              className="block rounded-lg bg-blue-600 px-4 py-3 font-medium"
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
          <header>
            <p className="text-sm font-medium text-blue-600">
              MANAGEMENT
            </p>

            <h2 className="mt-1 text-3xl font-bold">
              QR Codes
            </h2>

            <p className="mt-2 text-slate-500">
              View and monitor your QR codes.
            </p>
          </header>

          <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-sm text-slate-500">Total QR Codes</p>
              <p className="mt-2 text-3xl font-bold">
                {qrCodes.length}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-sm text-slate-500">Active</p>
              <p className="mt-2 text-3xl font-bold">
                {qrCodes.filter((qr) => qr.status === "Active").length}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-sm text-slate-500">Total Sample Scans</p>
              <p className="mt-2 text-3xl font-bold">
                {qrCodes.reduce((total, qr) => total + qr.scans, 0)}
              </p>
            </div>
          </div>

          <section className="mt-8 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 p-5">
              <h3 className="text-lg font-semibold">
                Your QR Codes
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Sample records for learning purposes.
              </p>
            </div>

            <div className="divide-y divide-slate-200">
              {qrCodes.map((qr) => (
                <article
                  key={qr.id}
                  className="p-5"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <h4 className="font-semibold">{qr.name}</h4>

                      <p className="mt-1 text-sm text-slate-500">
                        {qr.destination}
                      </p>

                      <p className="mt-2 break-all font-mono text-xs text-slate-400">
                        QR ID: {qr.id}
                      </p>
                    </div>

                    <span
                      className={`w-fit rounded-full px-3 py-1 text-xs font-semibold ${
                        qr.status === "Active"
                          ? "bg-green-100 text-green-800"
                          : "bg-slate-200 text-slate-700"
                      }`}
                    >
                      {qr.status}
                    </span>
                  </div>

                  <p className="mt-4 text-sm text-slate-600">
                    Sample scans:{" "}
                    <span className="font-semibold">{qr.scans}</span>
                  </p>
                </article>
              ))}
            </div>
          </section>

          <p className="mt-5 text-sm leading-6 text-slate-500">
            These records and scan counts are examples. They are not
            stored in your database, and the status labels do not
            change the real QR codes.
          </p>
        </section>
      </div>
    </main>
  );
}
