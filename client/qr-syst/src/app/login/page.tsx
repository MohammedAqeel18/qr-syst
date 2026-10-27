
"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { apiRequest } from "@/lib/api";

type LoginResponse = {
  message?: string;
  user?: {
    role?: string;
  };
};

function BrandIcon() {
  return (
    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-violet-600">
      <svg
        viewBox="0 0 40 40"
        fill="none"
        className="h-6 w-6"
        aria-hidden="true"
      >
        <path
          d="M7 7h10v10H7zM23 7h10v10H23zM7 23h10v10H7z"
          stroke="white"
          strokeWidth="3"
          strokeLinejoin="round"
        />
        <path
          d="M23 23h4v4h-4zM29 29h4M29 23v3"
          stroke="white"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}

function LockIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className="h-4 w-4"
      aria-hidden="true"
    >
      <rect
        x="5"
        y="10"
        width="14"
        height="11"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.7"
      />
      <path
        d="M8 10V7a4 4 0 0 1 8 0v3"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
      <path
        d="M12 14v3"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (loading) return;

    setError("");
    setLoading(true);

    try {
      await apiRequest<LoginResponse>("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim(),
          password,
        }),
      });

      router.replace("/");
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to sign in. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-[100svh] items-center justify-center overflow-x-hidden bg-black px-4 py-3 text-white">
      <div className="my-auto w-full max-w-[640px]">
    
        <header className="mb-3 flex items-center justify-center gap-2.5">
          <BrandIcon />

          <div>
            <h1 className="text-lg font-bold leading-5 tracking-tight">
              QR <span className="text-blue-400">Analytics</span>
            </h1>
            <p className="mt-0.5 text-[9px] font-medium uppercase tracking-[0.18em] text-neutral-500">
              Administration Portal
            </p>
          </div>
        </header>

        <section className="rounded-2xl bg-white p-4 text-neutral-900 shadow-2xl shadow-white/[0.04] sm:px-7 sm:py-5">
          <div className="mb-3">
            <div className="mb-1.5 inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-2 py-1 text-[9px] font-bold tracking-wider text-blue-700">
              <span className="h-1.5 w-1.5 rounded-full bg-blue-600" />
              SECURE ADMIN ACCESS
            </div>

            <h2 className="text-2xl font-bold leading-tight tracking-tight text-neutral-950">
              Welcome back.
            </h2>

            <p className="mt-1 text-sm leading-5 text-neutral-500">
              Sign in to manage your QR codes and analytics.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">

            <div>
              <label
                htmlFor="email"
                className="mb-1 block text-sm font-semibold text-neutral-800"
              >
                Email address
              </label>

              <input
                id="email"
                name="email"
                type="email"
                autoComplete="username"
                placeholder="admin@company.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
                maxLength={254}
                disabled={loading}
                className="h-10 w-full rounded-lg border border-neutral-200 bg-white px-3 text-sm text-neutral-950 outline-none transition placeholder:text-neutral-400 focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 disabled:opacity-60"
              />
            </div>


            <div>
              <label
                htmlFor="password"
                className="mb-1 block text-sm font-semibold text-neutral-800"
              >
                Password
              </label>

              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                  disabled={loading}
                  className="h-10 w-full rounded-lg border border-neutral-200 bg-white px-3 pr-14 text-sm text-neutral-950 outline-none transition placeholder:text-neutral-400 focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 disabled:opacity-60"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((current) => !current)}
                  disabled={loading}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  aria-pressed={showPassword}
                  className="absolute inset-y-0 right-0 rounded-r-lg px-3 text-xs font-semibold text-neutral-500 hover:text-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-600"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>


            {error && (
              <div
                role="alert"
                aria-live="polite"
                className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
              >
                {error}
              </div>
            )}

         
            <button
              type="submit"
              disabled={loading || !email.trim() || !password}
              className="flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-violet-600 px-4 text-sm font-semibold text-white transition hover:from-blue-700 hover:to-violet-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-500/25 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <>
                  <span
                    aria-hidden="true"
                    className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white"
                  />
                  Signing in...
                </>
              ) : (
                <>
                  Sign in
                  <span aria-hidden="true">→</span>
                </>
              )}
            </button>
          </form>


          <div className="mt-3 flex items-center justify-center gap-2 border-t border-neutral-100 pt-3 text-xs text-neutral-500">
            <span className="text-blue-600">
              <LockIcon />
            </span>
            Protected administrator session
          </div>
        </section>

        <p className="mt-3 text-center text-[10px] tracking-wider text-neutral-600">
          QR ANALYTICS · SECURE ACCESS
        </p>
      </div>
    </main>
  );
}
