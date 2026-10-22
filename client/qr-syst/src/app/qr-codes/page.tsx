
"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { apiRequest } from "@/lib/api";

type QRCode = {
  _id: string;
  name: string;
  iosUrl: string;
  androidUrl: string;
  createdAt?: string;
};

type QRListResponse = {
  success: boolean;
  count: number;
  data: QRCode[];
};

type QRCreateResponse = {
  success: boolean;
  message: string;
  data: QRCode;
};

export default function QRCodesPage() {
  const [qrCodes, setQrCodes] = useState<QRCode[]>([]);
  const [name, setName] = useState("");
  const [iosUrl, setIosUrl] = useState("");
  const [androidUrl, setAndroidUrl] = useState("");

  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadQRCodes = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await apiRequest<QRListResponse>("/api/qr");
      setQrCodes(response.data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not load QR codes.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadQRCodes();
  }, [loadQRCodes]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setSuccess("");
    setCreating(true);

    try {
      const response = await apiRequest<QRCreateResponse>("/api/qr", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          iosUrl,
          androidUrl,
        }),
      });

      setSuccess(response.message || "QR code created successfully.");
      setName("");
      setIosUrl("");
      setAndroidUrl("");

      await loadQRCodes();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not create QR code.",
      );
    } finally {
      setCreating(false);
    }
  }

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
            <p className="text-sm font-medium text-blue-600">MANAGEMENT</p>
            <h2 className="mt-1 text-3xl font-bold">QR Codes</h2>
            <p className="mt-2 text-slate-500">
              Create and manage your app-download QR codes.
            </p>
          </header>

          <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-sm text-slate-500">Total QR Codes</p>
              <p className="mt-2 text-3xl font-bold">{qrCodes.length}</p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-sm text-slate-500">Storage</p>
              <p className="mt-2 text-3xl font-bold">MongoDB</p>
              <p className="mt-1 text-sm text-slate-500">
                Records loaded from your backend
              </p>
            </div>
          </div>

          <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <h3 className="text-lg font-semibold">Create a QR Code</h3>
            <p className="mt-1 text-sm text-slate-500">
              Enter the destination app-store URLs for each platform.
            </p>

            <form onSubmit={handleSubmit} className="mt-6 space-y-5">
              <div>
                <label
                  htmlFor="qr-name"
                  className="mb-2 block text-sm font-medium"
                >
                  QR Code Name
                </label>
                <input
                  id="qr-name"
                  name="name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  required
                  minLength={2}
                  maxLength={100}
                  placeholder="e.g. Main App Download"
                  className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div>
                <label
                  htmlFor="ios-url"
                  className="mb-2 block text-sm font-medium"
                >
                  Apple App Store URL
                </label>
                <input
                  id="ios-url"
                  name="iosUrl"
                  type="url"
                  value={iosUrl}
                  onChange={(event) => setIosUrl(event.target.value)}
                  required
                  placeholder="https://apps.apple.com/..."
                  className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div>
                <label
                  htmlFor="android-url"
                  className="mb-2 block text-sm font-medium"
                >
                  Google Play Store URL
                </label>
                <input
                  id="android-url"
                  name="androidUrl"
                  type="url"
                  value={androidUrl}
                  onChange={(event) => setAndroidUrl(event.target.value)}
                  required
                  placeholder="https://play.google.com/store/apps/..."
                  className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              {error && (
                <p
                  role="alert"
                  className="rounded-lg bg-red-50 p-3 text-sm text-red-700"
                >
                  {error}
                </p>
              )}

              {success && (
                <p
                  role="status"
                  className="rounded-lg bg-green-50 p-3 text-sm text-green-700"
                >
                  {success}
                </p>
              )}

              <button
                type="submit"
                disabled={creating}
                className="rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {creating ? "Creating..." : "Create QR Code"}
              </button>
            </form>
          </section>

          <section className="mt-8 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 p-5">
              <h3 className="text-lg font-semibold">Your QR Codes</h3>
              <p className="mt-1 text-sm text-slate-500">
                These records are loaded from your backend.
              </p>
            </div>

            {loading ? (
              <p className="p-5 text-slate-500">Loading QR codes...</p>
            ) : qrCodes.length === 0 ? (
              <p className="p-5 text-slate-500">
                No QR codes found. Create your first one above.
              </p>
            ) : (
              <div className="divide-y divide-slate-200">
                {qrCodes.map((qr) => (
                  <article key={qr._id} className="p-5">
                    <h4 className="font-semibold">{qr.name}</h4>

                    <p className="mt-2 text-sm text-slate-500">
                      Apple App Store
                    </p>
                    <a
                      href={qr.iosUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-1 block break-all text-sm text-blue-600 hover:underline"
                    >
                      {qr.iosUrl}
                    </a>

                    <p className="mt-3 text-sm text-slate-500">
                      Google Play Store
                    </p>
                    <a
                      href={qr.androidUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-1 block break-all text-sm text-blue-600 hover:underline"
                    >
                      {qr.androidUrl}
                    </a>

                    <p className="mt-3 break-all font-mono text-xs text-slate-400">
                      QR ID: {qr._id}
                    </p>

                    {qr.createdAt && (
                      <p className="mt-2 text-xs text-slate-500">
                        Created: {new Date(qr.createdAt).toLocaleString()}
                      </p>
                    )}
                  </article>
                ))}
              </div>
            )}
          </section>
        </section>
      </div>
    </main>
  );
}
