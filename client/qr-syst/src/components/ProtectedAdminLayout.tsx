
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiRequest } from "@/lib/api";
import AdminLayout from "@/components/AdminLayout";

interface Admin {
  id: string;
  email: string;
  role: string;
}

interface AuthResponse {
  success: boolean;
  admin: Admin;
}

type ProtectedAdminLayoutProps = {
  children: React.ReactNode;
};

export default function ProtectedAdminLayout({
  children,
}: ProtectedAdminLayoutProps) {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function verifySession() {
      try {
        await apiRequest<AuthResponse>("/api/auth/me");

        if (cancelled) return;

        setError("");
      } catch (err) {
        if (cancelled) return;

        const message =
          err instanceof Error
            ? err.message
            : "Unable to verify administrator session.";

        if (
          message.toLowerCase().includes(
            "authentication required"
          )
        ) {
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

  return <AdminLayout>{children}</AdminLayout>;
}
