
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiRequest } from "@/lib/api";
import type { Admin, CurrentAdminResponse } from "@/types/auth";

export default function ProtectedDashboard() {
  const router = useRouter();

  const [admin, setAdmin] = useState<Admin | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function checkSession() {
      try {
        const result = await apiRequest<CurrentAdminResponse>(
          "/api/auth/me",
        );

        if (!cancelled) {
          setAdmin(result.admin);
        }
      } catch {
        if (!cancelled) {
          router.replace("/login");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void checkSession();

    return () => {
      cancelled = true;
    };
  }, [router]);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-100">
        <p className="text-slate-600">Checking administrator session...</p>
      </main>
    );
  }

  if (!admin) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-100">
        <p className="text-slate-600">
          Redirecting to administrator login...
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-100 p-6 text-slate-900">
      <section className="mx-auto max-w-3xl rounded-2xl bg-white p-8 shadow-sm">
        <p className="text-sm font-medium text-blue-600">
          AUTHENTICATED ADMINISTRATOR
        </p>

        <h1 className="mt-2 text-3xl font-bold">
          Welcome to QR Analytics
        </h1>

        <p className="mt-4 text-slate-600">
          Signed in as: {admin.email}
        </p>

        <p className="mt-2 text-sm text-slate-500">
          Role: {admin.role}
        </p>

        <p className="mt-6 text-sm leading-6 text-slate-500">
          Your backend has verified your administrator session.
          In the next step, we'll restore your full dashboard layout
          inside this authenticated flow.
        </p>

        {error && (
          <p role="alert" className="mt-4 text-sm text-red-700">
            {error}
          </p>
        )}
      </section>
    </main>
  );
}
