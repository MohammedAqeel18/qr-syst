
"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type FormEvent,
} from "react";

import { apiRequest } from "@/lib/api";
import { QRCodeCanvas } from "qrcode.react";

type QRCode = {
  _id: string;
  qrId: string;
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

const QR_REDIRECT_BASE_URL =
  process.env.NEXT_PUBLIC_QR_REDIRECT_BASE_URL?.replace(/\/+$/, "");

function formatDate(date: string) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Qatar",
  }).format(new Date(date));
}

export default function QRCodesPage() {
  const [qrCodes, setQrCodes] = useState<QRCode[]>([]);
  const [name, setName] = useState("");
  const [iosUrl, setIosUrl] = useState("");
  const [androidUrl, setAndroidUrl] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [qrToDelete, setQrToDelete] = useState<QRCode | null>(null);

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
        err instanceof Error ? err.message : "Could not load QR codes."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadQRCodes();
  }, [loadQRCodes]);

  const filteredQRCodes = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();

    if (!search) return qrCodes;

    return qrCodes.filter(
      (qr) =>
        qr.name.toLowerCase().includes(search) ||
        qr.qrId.toLowerCase().includes(search)
    );
  }, [qrCodes, searchTerm]);

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
        err instanceof Error ? err.message : "Could not create QR code."
      );
    } finally {
      setCreating(false);
    }
  }

  async function handleDelete() {
    if (!qrToDelete) return;

    const qr = qrToDelete;

    setError("");
    setSuccess("");
    setDeletingId(qr.qrId);

    try {
      const response = await apiRequest<{
        success: boolean;
        message: string;
      }>(`/api/qr/${encodeURIComponent(qr.qrId)}`, {
        method: "DELETE",
      });

      setQrCodes((current) =>
        current.filter((item) => item.qrId !== qr.qrId)
      );

      setSuccess(response.message);
      setQrToDelete(null);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not delete QR code."
      );
    } finally {
      setDeletingId(null);
    }
  }

  function downloadQRCode(qr: QRCode) {
    const canvas = document.getElementById(
      `qr-canvas-${qr.qrId}`
    ) as HTMLCanvasElement | null;

    if (!canvas) {
      setError("QR image is not ready. Please try again.");
      return;
    }

    const link = document.createElement("a");

    link.href = canvas.toDataURL("image/png");

    const safeName =
      qr.name.trim().replace(/[^a-z0-9-_]+/gi, "-") || "qr-code";

    link.download = `${safeName}.png`;
    link.click();
  }

  return (
    <main className="min-w-0 flex-1 bg-slate-50 px-4 py-6 text-slate-900 transition-colors dark:bg-slate-950 dark:text-slate-100 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-8">

 
        <header className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
          <div>
            <div className="mb-3 flex items-center gap-2">
              <span className="h-2 w-2  bg-blue-600" />
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-600 dark:text-blue-400">
                QR Management
              </p>
            </div>

            <h1 className="text-3xl font-bold tracking-tight text-slate-950 dark:text-white sm:text-4xl">
              QR Codes
            </h1>

            <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500 dark:text-slate-400">
              Create, organize and manage your application download QR codes
              from one place.
            </p>
          </div>

          <div className="flex items-center gap-3  border border-slate-200 bg-white px-4 py-3 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex h-10 w-10 items-center justify-center  bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400">
              <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" stroke="currentColor" strokeWidth="1.8">
                <rect x="3" y="3" width="7" height="7" rx="1" />
                <rect x="14" y="3" width="7" height="7" rx="1" />
                <rect x="3" y="14" width="7" height="7" rx="1" />
                <path d="M14 14h3v3h-3zM20 14v2M17 20h4M20 18v3" />
              </svg>
            </div>

            <div>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                Total QR codes
              </p>
              <p className="text-xl font-bold tabular-nums">
                {qrCodes.length}
              </p>
            </div>
          </div>
        </header>


        {error && (
          <div
            role="alert"
            className="flex items-start gap-3  border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300"
          >
            <span className="font-bold">!</span>
            <p>{error}</p>
            <button
              type="button"
              onClick={() => setError("")}
              className="ml-auto font-semibold"
              aria-label="Dismiss error"
            >
              ✕
            </button>
          </div>
        )}

        {success && (
          <div
            role="status"
            className="flex items-center gap-3  border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-300"
          >
            <span className="font-bold">✓</span>
            <p>{success}</p>
            <button
              type="button"
              onClick={() => setSuccess("")}
              className="ml-auto font-semibold"
              aria-label="Dismiss success message"
            >
              ✕
            </button>
          </div>
        )}

        {/* Statistics */}
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className=" border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                  Total QR codes
                </p>
                <p className="mt-3 text-3xl font-bold tracking-tight">
                  {qrCodes.length}
                </p>
                <p className="mt-2 text-xs text-slate-400">
                  QR records stored in your system
                </p>
              </div>

              <div className="flex h-12 w-12 items-center justify-center  bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400">
                <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6" stroke="currentColor" strokeWidth="1.8">
                  <rect x="3" y="3" width="7" height="7" rx="1" />
                  <rect x="14" y="3" width="7" height="7" rx="1" />
                  <rect x="3" y="14" width="7" height="7" rx="1" />
                  <path d="M14 14h3v3h-3zM20 14v2M17 20h4M20 18v3" />
                </svg>
              </div>
            </div>
          </div>

          <div className="border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                  Store destinations
                </p>
                <p className="mt-3 text-3xl font-bold tracking-tight">
                  {qrCodes.length * 2}
                </p>
                <p className="mt-2 text-xs text-slate-400">
                  Two app-store destinations per QR code
                </p>
              </div>

              <div className="flex h-12 w-12 items-center justify-center  bg-violet-50 text-violet-600 dark:bg-violet-950 dark:text-violet-400">
                <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6" stroke="currentColor" strokeWidth="1.8">
                  <path d="M12 3v18M3 12h18" />
                  <rect x="4" y="4" width="16" height="16" rx="4" />
                </svg>
              </div>
            </div>
          </div>
        </section>

       
        <section className="overflow-hidden  border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="border-b border-slate-100 px-5 py-5 dark:border-slate-800 sm:px-7">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center  bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400">
                <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" stroke="currentColor" strokeWidth="1.8">
                  <path d="M12 5v14M5 12h14" />
                </svg>
              </div>

              <div>
                <h2 className="text-lg font-bold">Create a new QR code</h2>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  Configure where your users should be redirected.
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 p-5 sm:p-7">
            <div>
              <label
                htmlFor="qr-name"
                className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200"
              >
                QR code name
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
                className="w-full  border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:bg-slate-800"
              />
              <p className="mt-2 text-xs text-slate-400">
                Choose a recognizable name to identify this QR code later.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
              {/* iOS */}
              <div className=" border border-slate-200 p-4 dark:border-slate-700 sm:p-5">
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center  bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-100">
                    <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
                      <path d="M16.7 12.8c0-2.2 1.8-3.3 1.9-3.4-1-1.5-2.6-1.7-3.2-1.7-1.4-.1-2.7.8-3.4.8s-1.8-.8-3-.8c-1.5 0-2.9.9-3.7 2.3-1.6 2.8-.4 7 1.1 9.3.7 1.1 1.5 2.3 2.6 2.2 1-.1 1.4-.7 2.7-.7s1.7.7 2.8.7c1.2 0 1.9-1.1 2.6-2.2.8-1.3 1.1-2.6 1.1-2.7-.1 0-2.5-1-2.5-3.8ZM14.5 6.2c.6-.7 1-1.7.9-2.7-.9 0-1.9.6-2.5 1.3-.5.6-1 1.6-.9 2.5 1 .1 1.9-.4 2.5-1.1Z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-bold">Apple App Store</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      For iPhone and iPad users
                    </p>
                  </div>
                </div>

                <label
                  htmlFor="ios-url"
                  className="mb-2 block text-xs font-semibold text-slate-600 dark:text-slate-300"
                >
                  App Store URL
                </label>

                <input
                  id="ios-url"
                  name="iosUrl"
                  type="url"
                  value={iosUrl}
                  onChange={(event) => setIosUrl(event.target.value)}
                  required
                  placeholder="https://apps.apple.com/..."
                  className="w-full  border border-slate-200 bg-slate-50 px-3 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:bg-slate-800"
                />
              </div>

              
              <div className=" border border-slate-200 p-4 dark:border-slate-700 sm:p-5">
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center  bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
                    <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
                      <path d="m5.1 4.1 1.4 2.4a8.1 8.1 0 0 1 11 0l1.4-2.4.9.5-1.5 2.5a8.1 8.1 0 0 1 3.2 6.4H2a8.1 8.1 0 0 1 3.2-6.4L3.7 4.6l1.4-.5ZM7 11a.8.8 0 1 0 0-1.6A.8.8 0 0 0 7 11Zm10 0a.8.8 0 1 0 0-1.6.8.8 0 0 0 0 1.6ZM3 14h18v4a2 2 0 0 1-2 2h-1v2h-2v-2H8v2H6v-2H5a2 2 0 0 1-2-2v-4Z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-bold">Google Play Store</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      For Android users
                    </p>
                  </div>
                </div>

                <label
                  htmlFor="android-url"
                  className="mb-2 block text-xs font-semibold text-slate-600 dark:text-slate-300"
                >
                  Play Store URL
                </label>

                <input
                  id="android-url"
                  name="androidUrl"
                  type="url"
                  value={androidUrl}
                  onChange={(event) => setAndroidUrl(event.target.value)}
                  required
                  placeholder="https://play.google.com/store/apps/..."
                  className="w-full  border border-slate-200 bg-slate-50 px-3 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:bg-slate-800"
                />
              </div>
            </div>

            <div className="flex flex-col justify-between gap-4 border-t border-slate-100 pt-5 dark:border-slate-800 sm:flex-row sm:items-center">
              <p className="text-xs leading-5 text-slate-400">
                One QR code automatically handles both iOS and Android
                destinations.
              </p>

              <button
                type="submit"
                disabled={creating}
                className="inline-flex items-center justify-center gap-2  bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {creating ? (
                  <>
                    <span className="h-4 w-4 animate-spin  border-2 border-white/40 border-t-white" />
                    Creating QR code...
                  </>
                ) : (
                  <>
                    <span className="text-lg leading-none">+</span>
                    Create QR code
                  </>
                )}
              </button>
            </div>
          </form>
        </section>


        <section className="space-y-5">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <h2 className="text-xl font-bold tracking-tight">
                Your QR library
              </h2>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Browse and manage your generated QR codes.
              </p>
            </div>

            <div className="relative w-full sm:max-w-xs">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="11" cy="11" r="7" />
                <path d="m16 16 4 4" />
              </svg>

              <input
                type="search"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search QR codes..."
                aria-label="Search QR codes"
                className="w-full  border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:border-slate-800 dark:bg-slate-900 dark:text-white"
              />
            </div>
          </div>

          {loading ? (
            <div className=" border border-slate-200 bg-white p-12 text-center dark:border-slate-800 dark:bg-slate-900">
              <div className="mx-auto h-8 w-8 animate-spin  border-2 border-slate-200 border-t-blue-600 dark:border-slate-700 dark:border-t-blue-400" />
              <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
                Loading your QR codes...
              </p>
            </div>
          ) : filteredQRCodes.length === 0 ? (
            <div className=" border border-dashed border-slate-300 bg-white px-6 py-14 text-center dark:border-slate-700 dark:bg-slate-900">
              <div className="mx-auto flex h-14 w-14 items-center justify-center  bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-300">
                <svg viewBox="0 0 24 24" fill="none" className="h-7 w-7" stroke="currentColor" strokeWidth="1.7">
                  <rect x="3" y="3" width="7" height="7" rx="1" />
                  <rect x="14" y="3" width="7" height="7" rx="1" />
                  <rect x="3" y="14" width="7" height="7" rx="1" />
                  <path d="M14 14h3v3h-3zM20 14v2M17 20h4M20 18v3" />
                </svg>
              </div>

              <h3 className="mt-4 font-semibold">
                {searchTerm ? "No matching QR codes" : "No QR codes yet"}
              </h3>

              <p className="mx-auto mt-2 max-w-sm text-sm text-slate-500 dark:text-slate-400">
                {searchTerm
                  ? "Try searching with a different name or QR ID."
                  : "Create your first QR code using the form above. It will appear here once created."}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
              {filteredQRCodes.map((qr) => {
                const scanUrl = QR_REDIRECT_BASE_URL
                  ? `${QR_REDIRECT_BASE_URL}/r/${qr.qrId}`
                  : "";

                return (
                  <article
                    key={qr._id}
                    className="group overflow-hidden  border border-slate-200 bg-white shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-lg hover:shadow-slate-200/60 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700 dark:hover:shadow-black/20"
                  >
                    <div className="flex flex-col gap-5 p-5 sm:flex-row sm:p-6">
                   
                      <div className="flex shrink-0 flex-col items-center justify-center rounded-2xl border border-slate-100 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
                        {scanUrl ? (
                          <QRCodeCanvas
                            id={`qr-canvas-${qr.qrId}`}
                            value={scanUrl}
                            size={176}
                            level="H"
                            marginSize={4}
                          />
                        ) : (
                          <div className="flex h-44 w-44 flex-col items-center justify-center text-center">
                            <span className="text-3xl text-red-500">!</span>
                            <p className="mt-2 text-xs text-slate-500">
                              Redirect URL is not configured.
                            </p>
                          </div>
                        )}

                        <span className="mt-3 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
                          QR Code
                        </span>
                      </div>

                   
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div className="min-w-0">
                            <h3 className="break-words text-lg font-bold text-slate-900 dark:text-white">
                              {qr.name}
                            </h3>
                            <p className="mt-1 text-xs text-slate-400">
                              App download QR code
                            </p>
                          </div>

                          <span className="inline-flex shrink-0 items-center gap-1.5  bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400">
                            <span className="h-1.5 w-1.5  bg-emerald-500" />
                            Generated
                          </span>
                        </div>

                        <div className="mt-5 space-y-3">
                          <div>
                            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                              Apple App Store
                            </p>
                            <a
                              href={qr.iosUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="mt-1 block break-all text-xs leading-5 text-blue-600 hover:underline dark:text-blue-400"
                            >
                              {qr.iosUrl}
                            </a>
                          </div>

                          <div>
                            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                              Google Play Store
                            </p>
                            <a
                              href={qr.androidUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="mt-1 block break-all text-xs leading-5 text-blue-600 hover:underline dark:text-blue-400"
                            >
                              {qr.androidUrl}
                            </a>
                          </div>
                        </div>
                      </div>
                    </div>

                 
                    <div className="border-t border-slate-100 px-5 py-4 dark:border-slate-800 sm:px-6">
                      <div className="flex flex-col gap-2 text-xs">
                        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                          <span className="font-medium text-slate-400">
                            QR ID
                          </span>
                          <span className="break-all font-mono text-slate-600 dark:text-slate-300">
                            {qr.qrId}
                          </span>
                        </div>

                        {qr.createdAt && (
                          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                            <span className="font-medium text-slate-400">
                              Created
                            </span>
                            <span className="text-slate-600 dark:text-slate-300">
                              {formatDate(qr.createdAt)}
                            </span>
                          </div>
                        )}

                        {scanUrl && (
                          <div className="mt-1">
                            <span className="font-medium text-slate-400">
                              Redirect URL
                            </span>
                            <p className="mt-1 break-all font-mono text-[11px] leading-5 text-slate-500 dark:text-slate-400">
                              {scanUrl}
                            </p>
                          </div>
                        )}
                      </div>
                 
                      <div className="mt-4 flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => downloadQRCode(qr)}
                          disabled={!scanUrl}
                          className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-blue-600 px-3 py-2.5 text-xs font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50 sm:flex-none"
                        >
                          <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" stroke="currentColor" strokeWidth="2">
                            <path d="M12 3v12m0 0 4-4m-4 4-4-4M4 17v3h16v-3" />
                          </svg>
                          Download PNG
                        </button>

                        <button
                          type="button"
                          onClick={() => setQrToDelete(qr)}
                          disabled={deletingId !== null}
                          className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg border border-red-200 bg-white px-3 py-2.5 text-xs font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-red-900/60 dark:bg-slate-900 dark:text-red-400 dark:hover:bg-red-950/30 sm:flex-none"
                        >
                          <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" stroke="currentColor" strokeWidth="1.8">
                            <path d="M4 7h16M10 11v6m4-6v6M5 7l1 14h12l1-14M9 7V4h6v3" />
                          </svg>
                          Delete
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </div>

 
      {qrToDelete && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm"
          onClick={() => {
            if (deletingId === null) setQrToDelete(null);
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-dialog-title"
            className="w-full max-w-md  border border-slate-200 bg-white p-6 text-slate-900 shadow-2xl dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex h-12 w-12 items-center justify-center  bg-red-50 text-red-600 dark:bg-red-950/50 dark:text-red-400">
              <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6" stroke="currentColor" strokeWidth="1.8">
                <path d="M12 9v4m0 4h.01M10.3 3.9 2.8 17a2 2 0 0 0 1.7 3h15a2 2 0 0 0 1.7-3l-7.5-13.1a2 2 0 0 0-3.4 0Z" />
              </svg>
            </div>

            <h2
              id="delete-dialog-title"
              className="mt-5 text-xl font-bold"
            >
              Delete QR code?
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
              You are about to delete{" "}
              <strong className="text-slate-800 dark:text-slate-200">
                {qrToDelete.name}
              </strong>
              . This action cannot be undone.
            </p>

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setQrToDelete(null)}
                disabled={deletingId !== null}
                className=" border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleDelete}
                disabled={deletingId !== null}
                className="bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {deletingId === qrToDelete.qrId
                  ? "Deleting..."
                  : "Yes, delete QR"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
