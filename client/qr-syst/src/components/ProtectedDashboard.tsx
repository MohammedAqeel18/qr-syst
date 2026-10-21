
"use client";

import { useEffect, useState } from "react";
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
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function verifySession() {
      try {
        const response = await apiRequest<AuthResponse>(
          "/api/auth/me"
        );

        setAdmin(response.admin);
      } catch {
        window.location.replace("/login");
      } finally {
        setLoading(false);
      }
    }

    verifySession();
  }, []);

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
    return <p role="alert">{error}</p>;
  }

  if (!admin) {
    return null;
  }

  return <DashboardContent />;
}
