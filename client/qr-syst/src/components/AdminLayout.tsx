
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { apiRequest } from "@/lib/api";

type AdminLayoutProps = {
  children: React.ReactNode;
};

const navigationItems = [
  { label: "Dashboard", href: "/" },
  { label: "Analytics", href: "/analytics" },
  { label: "QR Codes", href: "/qr-codes" },
];

type ThemeOption = "light" | "dark" | "system";

const themeOptions: {
  value: ThemeOption;
  label: string;
  icon: string;
}[] = [
  { value: "light", label: "Light", icon: "☀" },
  { value: "dark", label: "Dark", icon: "☾" },
  { value: "system", label: "System", icon: "▣" },
];

export default function AdminLayout({
  children,
}: AdminLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, setTheme } = useTheme();

  const [mounted, setMounted] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [logoutError, setLogoutError] = useState("");

  useEffect(() => {
    setMounted(true);
  }, []);

  async function handleLogout() {
    if (loggingOut) return;

    setLoggingOut(true);
    setLogoutError("");

    try {
      await apiRequest<{ success: boolean }>(
        "/api/auth/logout",
        { method: "POST" }
      );

      router.replace("/login");
      router.refresh();
    } catch (err) {
      setLogoutError(
        err instanceof Error
          ? err.message
          : "Unable to sign out. Please try again."
      );

      setLoggingOut(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 transition-colors dark:bg-slate-950 dark:text-slate-100 md:flex">
      <aside className="flex w-full shrink-0 flex-col border-b border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 md:sticky md:top-0 md:h-screen md:w-64 md:border-b-0 md:border-r md:p-6">
        <Link href="/" className="block">
          <div className="flex items-center gap-3">
           
<div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm">
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="26"
    height="26"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-label="QR code"
    role="img"
  >
    <rect x="3" y="3" width="7" height="7" rx="1" />
    <rect x="14" y="3" width="7" height="7" rx="1" />
    <rect x="3" y="14" width="7" height="7" rx="1" />
    <path d="M14 14h3v3h-3z" />
    <path d="M21 14v3h-3" />
    <path d="M14 21h3" />
    <path d="M21 21v-1" />
  </svg>
</div>


            <div>
              <h1 className="text-lg font-bold tracking-tight">
                IDriver QR System            

            </h1>

              <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                Administrator Panel
              </p>
            </div>
          </div>
        </Link>

        <p className="mb-3 mt-8 px-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
          Workspace
        </p>

        <nav
          aria-label="Main navigation"
          className="flex flex-wrap gap-2 md:flex-col"
        >
          {navigationItems.map((item) => {
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={`flex items-center  px-4 py-3 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="mt-6 border-t border-slate-200 pt-5 dark:border-slate-800 md:mt-auto">
          <p className="mb-3 text-sm font-semibold text-slate-700 dark:text-slate-200">
            Appearance
          </p>

          <div
            role="group"
            aria-label="Choose appearance"
            className="grid grid-cols-3 gap-2"
          >
            {themeOptions.map((option) => {
              const isActive =
                mounted && theme === option.value;

              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setTheme(option.value)}
                  disabled={!mounted}
                  aria-label={`${option.label} theme`}
                  aria-pressed={isActive}
                  title={option.label}
                  className={`flex flex-col items-center justify-center gap-2 rounded-xl border px-2 py-3 text-xs font-medium transition-colors disabled:cursor-wait ${
                    isActive
                      ? "border-blue-500 bg-blue-50 text-blue-700 dark:border-blue-400 dark:bg-blue-950 dark:text-blue-300"
                      : "border-slate-200 bg-white text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
                  }`}
                >
                  <span aria-hidden="true" className="text-xl leading-none">
                    {option.icon}
                  </span>
                  {option.label}
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={handleLogout}
            disabled={loggingOut}
            className="mt-4 w-full  border border-slate-200 px-4 py-3 text-left text-sm font-semibold text-slate-700 transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:text-slate-200 dark:hover:border-red-900 dark:hover:bg-red-950 dark:hover:text-red-300"
          >
            <span aria-hidden="true" className="mr-2">
              ↪
            </span>
            {loggingOut ? "Signing out..." : "Sign out"}
          </button>

          {logoutError && (
            <p
              role="alert"
              className="mt-3 break-words text-sm text-red-600 dark:text-red-300"
            >
              {logoutError}
            </p>
          )}
        </div>
      </aside>

      <main className="min-w-0 flex-1">
        {children}
      </main>
    </div>
  );
}
