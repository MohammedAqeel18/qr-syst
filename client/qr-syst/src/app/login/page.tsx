
'use client'

import Image from 'next/image'
import {
  FormEvent,
  KeyboardEvent,
  useState,
} from 'react'
import { useRouter } from 'next/navigation'
import { apiRequest } from '@/lib/api'

type LoginResponse = {
  message?: string
  admin?: {
    id?: string
    username?: string
    email?: string
    role?: string
  }
}

function UserIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="size-5"
      fill="none"
    >
      <circle
        cx="12"
        cy="8"
        r="4"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <path
        d="M4 20c.5-4 3.5-6 8-6s7.5 2 8 6"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  )
}

function LockIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="size-5"
      fill="none"
    >
      <rect
        x="5"
        y="10"
        width="14"
        height="11"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <path
        d="M8 10V7a4 4 0 0 1 8 0v3"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  )
}

function EyeIcon({ hidden }: { hidden: boolean }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="size-5"
      fill="none"
    >
      <path
        d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />

      <circle
        cx="12"
        cy="12"
        r="2.8"
        stroke="currentColor"
        strokeWidth="1.6"
      />

      {hidden && (
        <path
          d="m4 4 16 16"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
      )}
    </svg>
  )
}

const inputClass =
  'h-12 w-full  border border-[#e8e0e6] bg-[#faf8fa] pl-12 pr-4 text-sm text-[#29232a] outline-none transition-all placeholder:text-[#a49aa3] hover:border-[#d8c6d1] focus:border-[#740D45] focus:bg-white focus:ring-4 focus:ring-[#740D45]/10 disabled:cursor-not-allowed disabled:opacity-60'

export default function LoginPage() {
  const router = useRouter()

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [capsLock, setCapsLock] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function handleKey(event: KeyboardEvent<HTMLInputElement>) {
    setCapsLock(event.getModifierState('CapsLock'))
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (loading) return

    setError('')
    setLoading(true)

    try {
      await apiRequest<LoginResponse>('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: username.trim(),
          password,
          rememberMe,
        }),
      })

      router.replace('/')
    } catch (error: unknown) {
      setError(
        error instanceof Error
          ? error.message
          : 'Unable to sign in. Please try again.',
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="relative isolate flex min-h-[100svh] items-center justify-center overflow-hidden bg-[#F8F5F7] px-4 py-8 text-[#29232a] sm:px-6">

      {/* =========================================
          PREMIUM IDRIVER BACKGROUND
      ========================================= */}

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
      >
        {/* Base background */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_45%,#FFFFFF_0%,#F8F5F7_65%,#F2E7ED_100%)]" />

        {/* Top ambient lighting */}
        <div className="absolute -top-40 left-[15%] h-[450px] w-[850px] rounded-full bg-[#E8B5CE]/40 blur-[110px]" />

        {/* Top-left burgundy wave */}
        <div className="absolute -left-[340px] -top-[430px] h-[650px] w-[1050px] rotate-[-13deg] rounded-[50%] bg-gradient-to-br from-[#740D45] via-[#8D1858] to-[#E7A4C5] opacity-95" />

        {/* Top-left wave outline */}
        <div className="absolute -left-[300px] -top-[330px] h-[570px] w-[1100px] rotate-[-13deg] rounded-[50%] border border-[#8D1858]/20" />

        {/* Bottom-right burgundy wave */}
        <div className="absolute -bottom-[490px] -right-[300px] h-[650px] w-[1050px] rotate-[-12deg] rounded-[50%] bg-gradient-to-br from-[#E8A9C7] via-[#8D1858] to-[#740D45]" />

        {/* Bottom-right wave outline */}
        <div className="absolute -bottom-[390px] -right-[250px] h-[530px] w-[1050px] rotate-[-12deg] rounded-[50%] border border-white/70" />

        {/* Subtle center glow */}
        <div className="absolute left-1/2 top-1/2 h-[600px] w-[900px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/30 blur-[100px]" />

        {/* Top-right dotted pattern */}
        <div
          className="absolute right-[4%] top-[5%] h-32 w-32 opacity-30"
          style={{
            backgroundImage:
              'radial-gradient(#8D1858 1.5px, transparent 1.5px)',
            backgroundSize: '22px 22px',
          }}
        />

        {/* Bottom-left dotted pattern */}
        <div
          className="absolute bottom-[5%] left-[3%] h-32 w-32 opacity-25"
          style={{
            backgroundImage:
              'radial-gradient(#8D1858 1.5px, transparent 1.5px)',
            backgroundSize: '22px 22px',
          }}
        />
      </div>

      {/* =========================================
          LOGIN CARD
      ========================================= */}

      <section className="relative z-10 grid w-full max-w-[1000px] overflow-hidden  border border-white/90 bg-white shadow-[0_30px_100px_rgba(65,25,48,0.15)] lg:grid-cols-[1fr_1fr]">

        {/* =========================================
            LEFT BRAND PANEL
        ========================================= */}

        <aside className="relative hidden overflow-hidden bg-[#740D45] p-8 text-white lg:flex lg:min-h-[500px] lg:flex-col lg:justify-between xl:p-9">

          {/* Brand panel lighting */}
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-[radial-gradient(circle_at_10%_15%,rgba(255,255,255,0.10),transparent_35%),radial-gradient(circle_at_90%_85%,rgba(255,255,255,0.08),transparent_40%)]"
          />

          {/* Decorative circles */}
          <div
            aria-hidden="true"
            className="absolute -right-28 -top-24 size-80 rounded-full border border-white/10"
          />

          <div
            aria-hidden="true"
            className="absolute -bottom-24 -left-24 size-72 rounded-full border border-white/10"
          />

          {/* Company logo */}
          <div className="relative">
            <div className="inline-flex overflow-hidden rounded-2xl shadow-[0_15px_45px_rgba(0,0,0,0.18)] ring-1 ring-white/15">
              <Image
                src="/idriver-logo.png"
                alt="iDriver - Right Time. Right Place."
                width={160}
                height={160}
                priority
                className="h-[115px] w-[115px] object-contain"
              />
            </div>

            <p className="mt-5 text-xs font-medium uppercase tracking-[0.22em] text-white/65">
              Technology · Mobility · Innovation
            </p>
          </div>

          {/* Brand message */}
          <div className="relative my-6">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/[0.08] px-3 py-1.5 text-xs text-white/90">
              <span className="size-2 rounded-full bg-emerald-400" />
              Secure administration
            </div>

            <h2 className="max-w-[390px] text-3xl font-semibold leading-[1.15] tracking-[-0.045em] xl:text-4xl">
              Manage every scan.
              <span className="mt-1 block text-white/65">
                Understand every journey.
              </span>
            </h2>

            <p className="mt-4 max-w-[350px] text-sm leading-6 text-white/70">
              Your centralized workspace for QR campaigns,
              scan analytics, and intelligent campaign management.
            </p>
          </div>

          {/* Brand footer */}
          <div className="relative flex items-center justify-between border-t border-white/15 pt-4 text-xs text-white/55">
            <span>iDriver QR Analytics</span>
            <span>Administration portal</span>
          </div>
        </aside>

        {/* =========================================
            RIGHT LOGIN PANEL
        ========================================= */}

        <div className="flex flex-col justify-center px-6 py-7 sm:px-9 lg:px-10 xl:px-11">

          {/* Mobile logo */}
          <div className="mb-7 flex items-center gap-3 lg:hidden">
            <Image
              src="/idriver-logo.png"
              alt="iDriver"
              width={64}
              height={64}
              className="size-16 rounded-xl object-contain"
              priority
            />

            <div>
              <p className="font-semibold tracking-tight">
                iDriver
                <span className="text-[#740D45]">
                  {' '}QR Analytics
                </span>
              </p>

              <p className="mt-1 text-xs text-neutral-500">
                Administration portal
              </p>
            </div>
          </div>

          {/* Login heading */}
          <div className="mb-6">
            <div className="mb-4 inline-flex items-center gap-2  bg-[#740D45]/[0.06] px-3 py-1.5 text-xs font-semibold text-[#740D45]">
              <span className="size-1.5 rounded-full bg-[#740D45]" />
              SECURE ACCESS
            </div>

            <h1 className="text-[34px] font-semibold leading-tight tracking-[-0.055em] text-[#29232a] sm:text-[40px]">
              Welcome back<span className="text-[#740D45]">.</span>
            </h1>

            <p className="mt-2 text-sm leading-6 text-[#827781]">
              Sign in to access your administrative workspace.
            </p>
          </div>

          {/* Login form */}
          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Username */}
            <label className="block" htmlFor="username">
              <span className="mb-2 block text-sm font-medium text-[#443a45]">
                Username
              </span>

              <div className="group relative">
                <span className="absolute inset-y-0 left-4 flex items-center text-[#a69aa4] transition group-focus-within:text-[#740D45]">
                  <UserIcon />
                </span>

                <input
                  id="username"
                  name="username"
                  type="text"
                  autoComplete="username"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                  required
                  minLength={3}
                  maxLength={30}
                  disabled={loading}
                  className={inputClass}
                />
              </div>
            </label>

            {/* Password */}
            <label className="block" htmlFor="password">
              <span className="mb-2 block text-sm font-medium text-[#443a45]">
                Password
              </span>

              <div className="group relative">
                <span className="absolute inset-y-0 left-4 flex items-center text-[#a69aa4] transition group-focus-within:text-[#740D45]">
                  <LockIcon />
                </span>

                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  onKeyUp={handleKey}
                  onKeyDown={handleKey}
                  onBlur={() => setCapsLock(false)}
                  required
                  disabled={loading}
                  className={`${inputClass} pr-12`}
                />

                {/* Password visibility */}
                <button
                  type="button"
                  disabled={loading}
                  onClick={() =>
                    setShowPassword((current) => !current)
                  }
                  aria-label={
                    showPassword ? 'Hide password' : 'Show password'
                  }
                  aria-pressed={showPassword}
                  className="absolute inset-y-1 right-1 grid w-10 place-items-center rounded-lg text-[#a69aa4] transition hover:bg-[#740D45]/[0.06] hover:text-[#740D45] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#740D45]"
                >
                  <EyeIcon hidden={showPassword} />
                </button>
              </div>

              {/* Caps Lock warning */}
              {capsLock && (
                <p
                  className="mt-2 text-xs font-medium text-amber-600"
                  role="status"
                >
                  Caps Lock is on
                </p>
              )}
            </label>

            {/* Remember me */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex cursor-pointer items-center gap-2.5 text-sm text-[#827781]">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(event) =>
                    setRememberMe(event.target.checked)
                  }
                  disabled={loading}
                  className="size-4 rounded border-neutral-300 accent-[#740D45]"
                />

                Keep me signed in
              </label>
            </div>

            {/* Error message */}
            {error && (
              <div
                key={error}
                role="alert"
                aria-live="polite"
                className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-5 text-red-700"
              >
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  className="mt-0.5 size-4 shrink-0"
                  fill="none"
                >
                  <circle
                    cx="12"
                    cy="12"
                    r="9"
                    stroke="currentColor"
                    strokeWidth="1.7"
                  />

                  <path
                    d="M12 7.5v5.5M12 16.5v.01"
                    stroke="currentColor"
                    strokeWidth="1.9"
                    strokeLinecap="round"
                  />
                </svg>

                <span>{error}</span>
              </div>
            )}

            {/* Sign in button */}
            <button
              type="submit"
              disabled={loading || !username.trim() || !password}
              className="group relative flex h-12 w-full items-center justify-center gap-2 overflow-hidden  bg-[#740D45] px-4 text-sm font-semibold text-white shadow-[0_8px_24px_rgba(116,13,69,0.20)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#8D1858] hover:shadow-[0_12px_30px_rgba(116,13,69,0.28)] active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none"
            >
              {loading ? (
                <>
                  <span className="size-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                  Signing in...
                </>
              ) : (
                <>
                  Sign in to dashboard

                  <svg
                    aria-hidden="true"
                    viewBox="0 0 24 24"
                    fill="none"
                    className="size-4 transition-transform group-hover:translate-x-1"
                  >
                    <path
                      d="M5 12h14m-5-5 5 5-5 5"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </>
              )}
            </button>
          </form>

          {/* Security message */}
          <div className="mt-5 flex items-center justify-center gap-2 text-xs text-[#a69aa4]">
            <LockIcon />
            Protected administrative access
          </div>

          {/* Copyright */}
          <div className="mt-7 border-t border-[#eee7ed] pt-5 text-center text-[11px] text-[#a69aa4]">
            © {new Date().getFullYear()} iDriver Technology. All rights reserved.
          </div>
        </div>
      </section>
    </main>
  )
}
