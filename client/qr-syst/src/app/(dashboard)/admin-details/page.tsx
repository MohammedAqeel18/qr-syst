
"use client";

import { useEffect, useState, type FormEvent } from "react";
import { apiRequest } from "@/lib/api";

type Admin = {
  id: string;
  username: string;
  email: string;
  role: string;
  createdAt: string;
  updatedAt: string;
};

type ProfileResponse = {
  success: boolean;
  admin: Admin;
};

type UpdateProfileResponse = {
  success: boolean;
  message?: string;
  admin?: Admin;
};

type PasswordResponse = {
  success: boolean;
  message?: string;
};

export default function AdminDetailsPage() {
  const [admin, setAdmin] = useState<Admin | null>(null);

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  const [profileError, setProfileError] = useState("");
  const [profileSuccess, setProfileSuccess] = useState("");

  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");

  async function loadProfile() {
    setLoading(true);
    setProfileError("");

    try {
      const response = await apiRequest<ProfileResponse>(
        "/api/auth/profile"
      );

      setAdmin(response.admin);
      setUsername(response.admin.username);
      setEmail(response.admin.email);
    } catch (error) {
      setProfileError(
        error instanceof Error
          ? error.message
          : "Unable to load administrator details."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadProfile();
  }, []);

  async function handleProfileUpdate(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (savingProfile) return;

    setProfileError("");
    setProfileSuccess("");

    const trimmedUsername = username.trim();
    const trimmedEmail = email.trim();

    if (trimmedUsername.length < 3 || trimmedUsername.length > 30) {
      setProfileError(
        "Username must contain between 3 and 30 characters."
      );
      return;
    }

    if (!/^[a-zA-Z0-9._-]+$/.test(trimmedUsername)) {
      setProfileError(
        "Username can only contain letters, numbers, dots, underscores, and hyphens."
      );
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setProfileError("Please enter a valid email address.");
      return;
    }

    setSavingProfile(true);

    try {
      const response = await apiRequest<UpdateProfileResponse>(
        "/api/auth/profile",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: trimmedUsername,
            email: trimmedEmail,
          }),
        }
      );

      if (response.admin) {
        setAdmin(response.admin);
        setUsername(response.admin.username);
        setEmail(response.admin.email);
      } else {
        await loadProfile();
      }

      setProfileSuccess(
        response.message || "Administrator profile updated successfully."
      );
    } catch (error) {
      setProfileError(
        error instanceof Error
          ? error.message
          : "Unable to update your profile."
      );
    } finally {
      setSavingProfile(false);
    }
  }

  async function handlePasswordChange(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (changingPassword) return;

    setPasswordError("");
    setPasswordSuccess("");

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError("Please complete all password fields.");
      return;
    }

    if (newPassword.length < 8 || newPassword.length > 128) {
      setPasswordError(
        "Your new password must contain between 8 and 128 characters."
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("The new passwords do not match.");
      return;
    }

    if (currentPassword === newPassword) {
      setPasswordError(
        "Your new password must be different from your current password."
      );
      return;
    }

    setChangingPassword(true);

    try {
      const response = await apiRequest<PasswordResponse>(
        "/api/auth/password",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            currentPassword,
            newPassword,
          }),
        }
      );

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");

      setPasswordSuccess(
        response.message || "Your password has been changed successfully."
      );
    } catch (error) {
      setPasswordError(
        error instanceof Error
          ? error.message
          : "Unable to change your password."
      );
    } finally {
      setChangingPassword(false);
    }
  }

  function formatDate(date: string) {
    if (!date) return "Not available";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "Not available";
    }

    return new Intl.DateTimeFormat("en-GB", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(parsedDate);
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="text-center">
          <div className="mx-auto h-9 w-9 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />
          <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
            Loading administrator details...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 px-5 py-8 dark:bg-slate-950 md:px-8">
      <div className="mx-auto max-w-5xl">

        {/* Page heading */}
        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">
            Account Management
          </p>

          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            Admin Details
          </h1>

          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Manage your administrator profile and account security.
          </p>
        </div>

        {profileError && !admin && (
          <div
            role="alert"
            className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300"
          >
            {profileError}

            <button
              type="button"
              onClick={() => void loadProfile()}
              className="ml-3 font-semibold underline"
            >
              Try again
            </button>
          </div>
        )}

        {admin && (
          <>
            {/* Account overview */}
            <section className="mb-7 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-blue-600 text-2xl font-bold text-white">
                  {admin.username.charAt(0).toUpperCase()}
                </div>

                <div className="min-w-0 flex-1">
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                    {admin.username}
                  </h2>

                  <p className="mt-1 break-all text-sm text-slate-500 dark:text-slate-400">
                    {admin.email}
                  </p>

                  <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                    Administrator account
                  </div>
                </div>
              </div>

              <div className="mt-6 grid gap-4 border-t border-slate-100 pt-5 dark:border-slate-800 sm:grid-cols-2">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
                    Account created
                  </p>
                  <p className="mt-2 text-sm font-medium text-slate-700 dark:text-slate-200">
                    {formatDate(admin.createdAt)}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
                    Last profile update
                  </p>
                  <p className="mt-2 text-sm font-medium text-slate-700 dark:text-slate-200">
                    {formatDate(admin.updatedAt)}
                  </p>
                </div>
              </div>
            </section>

            {/* Profile editing */}
            <section className="mb-7 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="mb-6">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  Personal information
                </h2>

                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  Update your administrator username and email address.
                </p>
              </div>

              <form
                onSubmit={handleProfileUpdate}
                className="space-y-5"
              >
                <div>
                  <label
                    htmlFor="username"
                    className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200"
                  >
                    Username
                  </label>

                  <input
                    id="username"
                    type="text"
                    autoComplete="username"
                    value={username}
                    onChange={(event) => setUsername(event.target.value)}
                    minLength={3}
                    maxLength={30}
                    required
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                  />

                  <p className="mt-2 text-xs text-slate-400">
                    3–30 characters. Letters, numbers, dots, underscores, and hyphens.
                  </p>
                </div>

                <div>
                  <label
                    htmlFor="email"
                    className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200"
                  >
                    Email address
                  </label>

                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    maxLength={254}
                    required
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                  />
                </div>

                {profileError && (
                  <p
                    role="alert"
                    className="rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950 dark:text-red-300"
                  >
                    {profileError}
                  </p>
                )}

                {profileSuccess && (
                  <p
                    role="status"
                    className="rounded-lg bg-emerald-50 p-3 text-sm text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                  >
                    {profileSuccess}
                  </p>
                )}

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={savingProfile}
                    className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {savingProfile ? "Saving changes..." : "Save changes"}
                  </button>
                </div>
              </form>
            </section>

            {/* Password change */}
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="mb-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-300">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <rect x="3" y="11" width="18" height="11" rx="2" />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                  </div>

                  <div>
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                      Change password
                    </h2>

                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                      Keep your administrator account secure.
                    </p>
                  </div>
                </div>
              </div>

              <form
                onSubmit={handlePasswordChange}
                className="space-y-5"
              >
                <div>
                  <label
                    htmlFor="currentPassword"
                    className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200"
                  >
                    Current password
                  </label>

                  <input
                    id="currentPassword"
                    type="password"
                    autoComplete="current-password"
                    value={currentPassword}
                    onChange={(event) =>
                      setCurrentPassword(event.target.value)
                    }
                    required
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                  />
                </div>

                <div>
                  <label
                    htmlFor="newPassword"
                    className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200"
                  >
                    New password
                  </label>

                  <input
                    id="newPassword"
                    type="password"
                    autoComplete="new-password"
                    value={newPassword}
                    onChange={(event) =>
                      setNewPassword(event.target.value)
                    }
                    minLength={8}
                    maxLength={128}
                    required
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                  />

                  <p className="mt-2 text-xs text-slate-400">
                    Use between 8 and 128 characters.
                  </p>
                </div>

                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200"
                  >
                    Confirm new password
                  </label>

                  <input
                    id="confirmPassword"
                    type="password"
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChange={(event) =>
                      setConfirmPassword(event.target.value)
                    }
                    required
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                  />
                </div>

                {passwordError && (
                  <p
                    role="alert"
                    className="rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950 dark:text-red-300"
                  >
                    {passwordError}
                  </p>
                )}

                {passwordSuccess && (
                  <p
                    role="status"
                    className="rounded-lg bg-emerald-50 p-3 text-sm text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                  >
                    {passwordSuccess}
                  </p>
                )}

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={changingPassword}
                    className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200"
                  >
                    {changingPassword
                      ? "Updating password..."
                      : "Update password"}
                  </button>
                </div>
              </form>
            </section>
          </>
        )}
      </div>
    </div>
  );
}
