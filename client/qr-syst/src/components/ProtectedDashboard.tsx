
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiRequest } from "@/lib/api";
import DashboardContent from "@/components/DashboardContent";

interface Admin {
  id: string;
  email: string;
  role: string;
}

interface AuthResponse {
  success: boolean;
  admin: Admin;
}

export default function ProtectedDashboard() {
  const router = useRouter();

  const [admin, setAdmin] = useState<Admin | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function verifySession() {
      try {
        const response = await apiRequest<AuthResponse>(
          "/api/auth/me"
        );

        if (cancelled) return;

        setAdmin(response.admin);
        setError("");
      } catch (err) {
        if (cancelled) return;

        const message =
          err instanceof Error
            ? err.message
            : "Unknown session verification error";

        console.error("Session verification failed:", message);

        if (message.toLowerCase().includes("authentication required")) {
          router.replace("/login");
          return;
        }

        setError(message);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void verifySession();

    return () => {
      cancelled = true;
    };
  }, [router]);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-slate-600">
          Verifying administrator session...
        </p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p role="alert" className="text-red-600">
          {error}
        </p>
      </main>
    );
  }

  if (!admin) {
    return null;
  }

  return <DashboardContent />;
}
