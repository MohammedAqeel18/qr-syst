
"use client";

import {
  useCallback,
  useEffect,
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

export default function QRCodesPage() {
  const [qrCodes, setQrCodes] = useState<QRCode[]>([]);
  const [name, setName] = useState("");
  const [iosUrl, setIosUrl] = useState("");
  const [androidUrl, setAndroidUrl] = useState("");

  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [qrToDelete, setQrToDelete] = useState<QRCode | null>(null);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Load QR codes from the backend
  const loadQRCodes = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await apiRequest<QRListResponse>("/api/qr");

      setQrCodes(response.data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Could not load QR codes."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadQRCodes();
  }, [loadQRCodes]);

  // Create a new QR code
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setSuccess("");
    setCreating(true);

    try {
      const response = await apiRequest<QRCreateResponse>(
        "/api/qr",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name,
            iosUrl,
            androidUrl,
          }),
        }
      );

      setSuccess(
        response.message || "QR code created successfully."
      );

      setName("");
      setIosUrl("");
      setAndroidUrl("");

      await loadQRCodes();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Could not create QR code."
      );
    } finally {
      setCreating(false);
    }
  }

  // Delete a QR code
  async function handleDelete() {
    if (!qrToDelete) {
      return;
    }

    const qr = qrToDelete;

    setError("");
    setSuccess("");
    setDeletingId(qr.qrId);

    try {
      const response = await apiRequest<{
        success: boolean;
        message: string;
      }>(
        `/api/qr/${encodeURIComponent(qr.qrId)}`,
        {
          method: "DELETE",
        }
      );

      setQrCodes((currentQRCodes) =>
        currentQRCodes.filter(
          (item) => item.qrId !== qr.qrId
        )
      );

      setSuccess(response.message);
      setQrToDelete(null);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Could not delete QR code."
      );
    } finally {
      setDeletingId(null);
    }
  }

  // Download QR code as PNG
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
      qr.name.trim().replace(/[^a-z0-9-_]+/gi, "-") ||
      "qr-code";

    link.download = `${safeName}.png`;

    link.click();
  }

  return (
    <>
      {/* QR Codes page content */}
      <section className="min-w-0 flex-1 bg-slate-100 p-5 text-slate-900 transition-colors dark:bg-slate-950 dark:text-slate-100 sm:p-8">

        {/* Page heading */}
        <header>
          <p className="text-sm font-bold text-blue-600 dark:text-blue-400">
            Manage QR
          </p>

          <h2 className="mt-1 text-3xl font-bold text-slate-900 dark:text-slate-100">
            QR Codes
          </h2>

          <p className="mt-2 text-slate-500 dark:text-slate-400">
            Create and manage your app-download QR codes.
          </p>
        </header>

        {/* Statistics cards */}
        <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2">

          <div className="border border-slate-200 bg-white p-5 text-slate-900 shadow-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Total QR Codes
            </p>

            <p className="mt-2 text-3xl font-bold">
              {qrCodes.length}
            </p>
          </div>

          <div className="border border-slate-200 bg-white p-5 text-slate-900 shadow-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Storage
            </p>

            <p className="mt-2 text-3xl font-bold">
              MongoDB
            </p>

            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Records loaded from your backend
            </p>
          </div>

        </div>

        {/* Create QR Code form */}
        <section className="mt-8 border border-slate-200 bg-white p-5 text-slate-900 shadow-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 sm:p-6">

          <h3 className="text-lg font-semibold">
            Create a QR Code
          </h3>

          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Enter the destination app-store URLs for each platform.
          </p>

          <form
            onSubmit={handleSubmit}
            className="mt-6 space-y-5"
          >

            {/* QR name */}
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
                onChange={(event) =>
                  setName(event.target.value)
                }
                required
                minLength={2}
                maxLength={100}
                placeholder="e.g. Main App Download"
                className="w-full border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:placeholder-slate-400 dark:focus:ring-blue-900"
              />
            </div>

            {/* Apple App Store URL */}
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
                onChange={(event) =>
                  setIosUrl(event.target.value)
                }
                required
                placeholder="https://apps.apple.com/..."
                className="w-full border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:placeholder-slate-400 dark:focus:ring-blue-900"
              />
            </div>

            {/* Google Play Store URL */}
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
                onChange={(event) =>
                  setAndroidUrl(event.target.value)
                }
                required
                placeholder="https://play.google.com/store/apps/..."
                className="w-full border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:placeholder-slate-400 dark:focus:ring-blue-900"
              />
            </div>

            {/* Error message */}
            {error && (
              <p
                role="alert"
                className="bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950 dark:text-red-300"
              >
                {error}
              </p>
            )}

            {/* Success message */}
            {success && (
              <p
                role="status"
                className="bg-green-50 p-3 text-sm text-green-700 dark:bg-green-950 dark:text-green-300"
              >
                {success}
              </p>
            )}

            {/* Submit button */}
            <button
              type="submit"
              disabled={creating}
              className="bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {creating ? "Creating..." : "Create QR Code"}
            </button>

          </form>
        </section>

        {/* QR Codes list */}
        <section className="mt-8 overflow-hidden rounded-2xl border border-slate-200 bg-white text-slate-900 shadow-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100">

          <div className="border-b border-slate-200 p-5 dark:border-slate-700">
            <h3 className="text-lg font-semibold">
              Your QR Codes
            </h3>

            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              These records are loaded from your backend.
            </p>
          </div>

          {/* Loading state */}
          {loading ? (
            <p className="p-5 text-slate-500 dark:text-slate-400">
              Loading QR codes...
            </p>
          ) : qrCodes.length === 0 ? (
            <p className="p-5 text-slate-500 dark:text-slate-400">
              No QR codes found. Create your first one above.
            </p>
          ) : (

            <div className="divide-y divide-slate-200 dark:divide-slate-700">

              {qrCodes.map((qr) => (
                <article
                  key={qr._id}
                  className="p-5"
                >

                  <h4 className="font-semibold text-slate-900 dark:text-slate-100">
                    {qr.name}
                  </h4>

                  {/* QR image */}
                  <div className="mt-4">

                    {QR_REDIRECT_BASE_URL ? (
                      <div>

                        <QRCodeCanvas
                          id={`qr-canvas-${qr.qrId}`}
                          value={`${QR_REDIRECT_BASE_URL}/r/${qr.qrId}`}
                          size={200}
                          level="H"
                          marginSize={4}
                        />

                        <p className="mt-2 break-all text-xs text-slate-500 dark:text-slate-400">
                          Scan URL: {`${QR_REDIRECT_BASE_URL}/r/${qr.qrId}`}
                        </p>

                        {/* Download button */}
                        <button
                          type="button"
                          onClick={() => downloadQRCode(qr)}
                          className="mt-3 bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                        >
                          Download QR as PNG
                        </button>

                      </div>
                    ) : (
                      <p className="text-sm text-red-600 dark:text-red-400">
                        Set NEXT_PUBLIC_QR_REDIRECT_BASE_URL in .env.local.
                      </p>
                    )}

                    {/* Delete button */}
                    <button
                      type="button"
                      onClick={() => setQrToDelete(qr)}
                      disabled={deletingId !== null}
                      className="ml-2 mt-3 bg-green-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      Delete QR Code
                    </button>

                  </div>

                  {/* Apple App Store */}
                  <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                    Apple App Store
                  </p>

                  <a
                    href={qr.iosUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1 block break-all text-sm text-blue-600 hover:underline dark:text-blue-400"
                  >
                    {qr.iosUrl}
                  </a>

                  {/* Google Play Store */}
                  <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
                    Google Play Store
                  </p>

                  <a
                    href={qr.androidUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1 block break-all text-sm text-blue-600 hover:underline dark:text-blue-400"
                  >
                    {qr.androidUrl}
                  </a>

                  {/* QR ID */}
                  <p className="mt-3 break-all font-mono text-xs text-slate-400">
                    QR ID: {qr._id}
                  </p>

                  {/* Creation date */}
                  {qr.createdAt && (
                    <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                      Created: {new Date(qr.createdAt).toLocaleString()}
                    </p>
                  )}

                </article>
              ))}

            </div>
          )}

        </section>

      </section>

      {/* Delete confirmation modal */}
      {qrToDelete && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          onClick={() => {
            if (deletingId === null) {
              setQrToDelete(null);
            }
          }}
        >

          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-dialog-title"
            className="w-full max-w-md rounded-2xl bg-white p-6 text-slate-900 shadow-2xl dark:bg-slate-900 dark:text-slate-100"
            onClick={(event) => event.stopPropagation()}
          >

            <div className="flex items-center justify-between">

              <h2
                id="delete-dialog-title"
                className="text-xl font-bold text-slate-900 dark:text-slate-100"
              >
                Delete QR Code
              </h2>

              <button
                type="button"
                onClick={() => setQrToDelete(null)}
                disabled={deletingId !== null}
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 disabled:opacity-50 dark:text-slate-400 dark:hover:bg-slate-800"
                aria-label="Close confirmation popup"
              >
                ✕
              </button>

            </div>

            {/* Warning message */}
            <div className="mt-5 bg-red-50 p-4 dark:bg-red-950">

              <div className="flex items-center gap-3">
                <span className="text-2xl">⚠️</span>

                <p className="font-semibold text-red-700 dark:text-red-300">
                  Are you sure you want to delete this QR code?
                </p>
              </div>

              <p className="mt-3 text-sm text-red-600 dark:text-red-300">
                QR Code: {qrToDelete.name}
              </p>

              <p className="mt-2 text-sm text-red-600 dark:text-red-300">
                This action cannot be undone.
              </p>

            </div>

            {/* Modal actions */}
            <div className="mt-6 flex justify-end gap-3">

              <button
                type="button"
                onClick={() => setQrToDelete(null)}
                disabled={deletingId !== null}
                className="border border-slate-300 px-4 py-2 font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-50 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleDelete}
                disabled={deletingId !== null}
                className="bg-red-600 px-4 py-2 font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {deletingId === qrToDelete.qrId
                  ? "Deleting..."
                  : "Yes, Delete"}
              </button>

            </div>

          </div>

        </div>
      )}
       
    </>
  );
}
