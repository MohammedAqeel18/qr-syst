'use client'

import {
  FormEvent,
  KeyboardEvent,
  useState,
} from 'react'
import { useRouter } from 'next/navigation'
import { apiRequest } from '@/lib/api'

type LoginResponse = {
  message?: string
  user?: {
    role?: string
  }
}

function BrandMark() {
  return (
    <div className="grid size-11 shrink-0 place-items-center rounded-[14px] bg-gradient-to-br from-blue-500 to-violet-600 text-white shadow-[0_10px_30px_rgba(37,99,235,.3)] ring-1 ring-white/20">
      <svg
        aria-hidden="true"
        viewBox="0 0 40 40"
        className="size-6"
        fill="none"
      >
        <path
          d="M7 7h10v10H7zM23 7h10v10H23zM7 23h10v10H7z"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinejoin="round"
        />
        <path
          d="M23 23h4v4h-4zM29 29h4M29 23v3"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  )
}

function MailIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="size-4"
      fill="none"
    >
      <rect
        x="3"
        y="5"
        width="18"
        height="14"
        rx="2.5"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <path
        d="m4 7 8 6 8-6"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function LockIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="size-4"
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
      className="size-[18px]"
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

const fieldClass =
  'h-12 w-full rounded-xl border border-neutral-200 bg-white/80 pl-11 text-sm text-neutral-950 outline-none transition placeholder:text-neutral-400 hover:border-neutral-300 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:opacity-60'

export default function LoginPage() {
  const router = useRouter()

  const [email, setEmail] = useState('')
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
          email: email.trim(),
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
    <main className="relative grid h-[100svh] min-h-[540px] overflow-hidden bg-[#f1f3ec] p-4 text-[#171a17] sm:p-6">
      <style>{`
        @keyframes ambient-drift {
          from {
            transform: translate3d(0, 0, 0) scale(1);
          }
          to {
            transform: translate3d(24px, -18px, 0) scale(1.08);
          }
        }

        @keyframes enter {
          from {
            opacity: 0;
            transform: translateY(16px) scale(.985);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-5px); }
          40% { transform: translateX(4px); }
          60% { transform: translateX(-3px); }
          80% { transform: translateX(2px); }
        }

        @keyframes status-pulse {
          0% {
            transform: scale(.7);
            opacity: .8;
          }
          100% {
            transform: scale(2);
            opacity: 0;
          }
        }

        .ambient-orb {
          animation: ambient-drift 9s ease-in-out infinite alternate;
        }

        .login-card {
          animation: enter .7s cubic-bezier(.2,.8,.2,1) both;
        }

        .login-error {
          animation: shake .4s ease-in-out;
        }

        .status-ring {
          animation: status-pulse 2s ease-out infinite;
        }

        .side-grid {
          background-image:
            linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px);
          background-size: 28px 28px;
          mask-image: linear-gradient(to bottom right, black, transparent 78%);
        }

        @media (prefers-reduced-motion: reduce) {
          .ambient-orb,
          .login-card,
          .login-error,
          .status-ring {
            animation: none;
          }
        }
      `}</style>


      <div
        aria-hidden="true"
        className="ambient-orb pointer-events-none absolute left-[7%] top-[3%] size-96 rounded-full bg-blue-300/35 blur-[100px]"
      />
      <div
        aria-hidden="true"
        className="ambient-orb pointer-events-none absolute bottom-[-15%] right-[5%] size-[420px] rounded-full bg-violet-300/30 blur-[110px]"
        style={{ animationDelay: '-4s' }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/2 h-[620px] w-[1050px] -translate-x-1/2 -translate-y-1/2 rounded-[50%] border border-white/70 bg-white/20 shadow-[inset_0_0_100px_rgba(255,255,255,.55)]"
      />

      <section className="login-card relative m-auto grid w-full max-w-[920px] overflow-hidden rounded-[30px] border border-white/90 bg-white/90 shadow-[0_35px_100px_rgba(34,42,31,.16)] backdrop-blur-2xl md:grid-cols-[.72fr_1.28fr]">
        
        <aside className="relative hidden overflow-hidden bg-[#10131c] p-8 text-white md:flex md:flex-col md:justify-between">
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-[radial-gradient(circle_at_15%_10%,rgba(59,130,246,.4),transparent_38%),radial-gradient(circle_at_90%_90%,rgba(124,58,237,.35),transparent_45%)]"
          />
          <div
            aria-hidden="true"
            className="side-grid absolute inset-0 opacity-30"
          />
          <div
            aria-hidden="true"
            className="absolute -bottom-24 -right-28 size-72 rounded-full border border-white/10"
          />
          <div
            aria-hidden="true"
            className="absolute -bottom-8 -right-8 size-40 rounded-full border border-blue-400/20"
          />

          <div className="relative flex items-center gap-3">
            <BrandMark />

            <div>
              <p className="font-semibold tracking-[-0.03em]">
                IDriver <span className="text-blue-400">QR System</span>
              </p>
              <p className="mt-0.5 text-[10px] uppercase tracking-[0.18em] text-white/40">
                Administration portal
              </p>
            </div>
          </div>

          <div className="relative my-10">
            <div className="mb-5 grid size-11 place-items-center rounded-full border border-blue-400/25 bg-blue-400/10 text-blue-300 shadow-[0_0_30px_rgba(59,130,246,.12)]">
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                className="size-5"
                fill="none"
              >
                <path
                  d="M12 3 5 6v5c0 4.6 2.8 8 7 10 4.2-2 7-5.4 7-10V6l-7-3Z"
                  stroke="currentColor"
                  strokeWidth="1.6"
                />
                <path
                  d="m9 12 2 2 4-4"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>

            <h2 className="max-w-[230px] text-[1.75rem] font-medium leading-[1.15] tracking-[-0.045em]">
              Your QR command center, secured.
            </h2>

            <p className="mt-4 max-w-[235px] text-sm leading-6 text-white/50">
              Monitor scans, manage campaigns, and access analytics from one
              protected workspace.
            </p>
          </div>

          <div className="relative flex items-center gap-2 text-[11px] text-white/40">
            <span className="relative grid size-2 place-items-center">
              <span className="status-ring absolute size-2 rounded-full bg-emerald-400" />
              <span className="relative size-1.5 rounded-full bg-emerald-400" />
            </span>
            All systems operational
          </div>
        </aside>

        {/* Login form */}
        <div className="p-6 sm:p-8 lg:px-11 lg:py-9">
          <div className="mb-5 flex items-center gap-3 md:hidden">
            <BrandMark />

            <div>
              <p className="font-semibold tracking-[-0.03em]">
                QR <span className="text-blue-600">Analytics</span>
              </p>
              <p className="text-xs text-neutral-500">
                Administration portal
              </p>
            </div>
          </div>

          <div className="mb-6">
            <div className="mb-2 flex items-center gap-2">
              <span className="h-px w-5 bg-blue-600" />
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-blue-600">
                Secure access
              </p>
            </div>

            <h1 className="text-[2rem] font-semibold leading-tight tracking-[-0.05em] text-neutral-950 sm:text-[2.35rem]">
              Welcome back
            </h1>

            <p className="mt-1.5 text-sm text-neutral-500">
              Enter your credentials to access the dashboard.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block" htmlFor="email">
                <span className="mb-1.5 block text-xs font-semibold text-neutral-700">
                  Email address
                </span>

                <div className="group relative">
                  <span className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-neutral-400 transition group-focus-within:text-blue-600">
                    <MailIcon />
                  </span>

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
                    className={`${fieldClass} pr-4`}
                  />
                </div>
              </label>

              <label className="block" htmlFor="password">
                <span className="mb-1.5 block text-xs font-semibold text-neutral-700">
                  Password
                </span>

                <div className="group relative">
                  <span className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-neutral-400 transition group-focus-within:text-blue-600">
                    <LockIcon />
                  </span>

                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    placeholder="Your password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    onKeyUp={handleKey}
                    onKeyDown={handleKey}
                    onBlur={() => setCapsLock(false)}
                    required
                    disabled={loading}
                    className={`${fieldClass} pr-12`}
                  />

                  <button
                    type="button"
                    disabled={loading}
                    onClick={() =>
                      setShowPassword((current) => !current)
                    }
                    aria-label={
                      showPassword
                        ? 'Hide password'
                        : 'Show password'
                    }
                    aria-pressed={showPassword}
                    className="absolute inset-y-1 right-1 grid w-9 place-items-center rounded-lg text-neutral-400 transition hover:bg-neutral-100 hover:text-neutral-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                  >
                    <EyeIcon hidden={showPassword} />
                  </button>
                </div>

                {capsLock && (
                  <p
                    className="mt-1.5 text-xs font-medium text-amber-600"
                    role="status"
                  >
                    Caps Lock is on
                  </p>
                )}
              </label>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex cursor-pointer items-center gap-2.5 text-xs text-neutral-600">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(event) =>
                    setRememberMe(event.target.checked)
                  }
                  disabled={loading}
                  className="size-3.5 rounded border-neutral-300 accent-blue-600"
                />
                Keep me signed in
              </label>

              
            </div>

            {error && (
              <div
                key={error}
                role="alert"
                aria-live="polite"
                className="login-error flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm leading-5 text-red-700"
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

            <button
              type="submit"
              disabled={loading || !email.trim() || !password}
              className="group flex h-12 w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 px-4 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(37,99,235,.25)] ring-1 ring-inset ring-white/20 transition duration-300 hover:-translate-y-0.5 hover:brightness-110 hover:shadow-[0_16px_36px_rgba(37,99,235,.35)] active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none"
            >
              {loading ? (
                <>
                  <span
                    aria-hidden="true"
                    className="size-4 animate-spin rounded-full border-2 border-white/40 border-t-white"
                  />
                  Signing in…
                </>
              ) : (
                <>
                  Sign in to dashboard

                  <svg
                    aria-hidden="true"
                    viewBox="0 0 24 24"
                    className="size-4 transition-transform group-hover:translate-x-1"
                    fill="none"
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

          <div className="mt-5 flex items-center justify-center gap-2 text-[11px] text-neutral-400">
            <LockIcon />
            Your administrative session is encrypted and protected
          </div>
        </div>
      </section>
    </main>
  )
}