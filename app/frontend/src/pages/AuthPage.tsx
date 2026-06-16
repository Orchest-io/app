import { useEffect, useMemo, useState, useRef } from 'react'
import type { FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { Button, Card } from '../components/ui'
import { useLoginUser, useRegisterUser, useGoogleAuth } from '../hooks/useAuthMutations'

// Extend window to include Google Identity Services
declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string
            callback: (response: { credential: string }) => void
            auto_select?: boolean
          }) => void
          prompt: () => void
        }
      }
    }
  }
}

// Decode a JWT payload without verification (client-side display only)
function decodeJwtPayload(token: string): Record<string, string> {
  try {
    const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')
    return JSON.parse(atob(base64))
  } catch {
    return {}
  }
}

type AuthMode = 'login' | 'register'

type AuthPageProps = {
  mode: AuthMode
}

type FormState = {
  fullName: string
  email: string
  password: string
  confirmPassword: string
}

type FieldName = keyof FormState
type FormErrors = Partial<Record<FieldName, string>>

type AuthFieldProps = {
  id: FieldName
  label: string
  type: string
  value: string
  placeholder: string
  error?: string
  disabled?: boolean
  autoComplete?: string
  labelAction?: React.ReactNode
  onChange: (field: FieldName, value: string) => void
}

const initialForm: FormState = {
  fullName: '',
  email: '',
  password: '',
  confirmPassword: '',
}

function getErrorMessage(error: unknown, fallback: string) {
  if (typeof error === 'object' && error && 'response' in error) {
    const response = (error as { response?: { data?: { message?: string | string[] } } }).response
    const message = response?.data?.message
    if (Array.isArray(message)) return message.join(', ')
    if (message) return message
  }

  if (error instanceof Error) return error.message
  return fallback
}

function AuthField({
  id,
  label,
  type,
  value,
  placeholder,
  error,
  disabled,
  autoComplete,
  labelAction,
  onChange,
}: AuthFieldProps) {
  const errorId = `${id}-error`

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex min-h-[18px] items-center justify-between gap-3">
        <label
          htmlFor={id}
          className="text-[11px] font-semibold uppercase tracking-[0.15em] text-on-surface-variant"
        >
          {label}
        </label>
        {labelAction}
      </div>
      <input
        id={id}
        aria-describedby={error ? errorId : undefined}
        aria-invalid={!!error}
        autoComplete={autoComplete}
        className={`h-[52px] w-full rounded-xl border bg-[#09101a]/65 px-4 text-[14px] text-on-surface shadow-[inset_0_1px_0_rgba(255,255,255,0.03)] outline-none transition-all duration-200 placeholder:text-[#687184] focus:border-electric-blue/70 focus:bg-[#0a1420] focus:shadow-[0_0_0_3px_rgba(0,123,255,0.16)] disabled:cursor-not-allowed disabled:opacity-60 ${
          error ? 'border-error/80' : 'border-white/12'
        }`}
        disabled={disabled}
        placeholder={placeholder}
        type={type}
        value={value}
        onChange={(event) => onChange(id, event.target.value)}
      />
      {error && (
        <p id={errorId} className="text-[11px] font-medium text-error" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}

function AuthLogo() {
  const { t } = useTranslation()
  return (
    <div className="flex items-center gap-4">
      <div className="flex h-[42px] w-[42px] items-center justify-center rounded-[10px] bg-[#4b8fff] text-[#05101f] shadow-[0_12px_35px_rgba(0,123,255,0.22)]">
        <span
          className="material-symbols-outlined text-[24px]"
          style={{ fontVariationSettings: "'FILL' 1, 'wght' 600, 'GRAD' 0, 'opsz' 24" }}
        >
          conversion_path
        </span>
      </div>
      <h1 className="font-heading text-[24px] font-bold tracking-[-0.03em] text-on-surface">
        {t('auth.appName')}
      </h1>
    </div>
  )
}

function MarketingScene() {
  const { t } = useTranslation()
  return (
    <section className="relative min-h-[620px] overflow-hidden bg-[#08101a] lg:min-h-screen">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_20%,rgba(0,123,255,0.23),transparent_34%),radial-gradient(circle_at_53%_45%,rgba(124,233,255,0.13),transparent_31%),linear-gradient(140deg,#071018_0%,#0b2031_45%,#030608_100%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,0.6)_0%,rgba(0,0,0,0.18)_30%,rgba(0,0,0,0.08)_100%)]" />

      <div className="absolute -left-24 top-1/3 h-40 w-40 rounded-full border border-cyan-300/10" />
      <div className="absolute -left-16 top-[34%] h-52 w-52 rounded-full border border-cyan-300/10" />
      <div className="absolute right-[16%] top-[-7%] h-[640px] w-[640px] rounded-full border border-white/8" />
      <div className="absolute right-[7%] top-[-12%] h-[760px] w-[760px] rounded-full border border-white/7" />

      <div className="absolute bottom-[180px] left-[18%] h-[460px] w-[78px] -skew-y-6 border border-cyan-300/15 bg-gradient-to-b from-cyan-200/20 via-[#102637]/75 to-black/30 shadow-[0_0_42px_rgba(80,218,255,0.16)]" />
      <div className="absolute bottom-[175px] left-[26%] h-[520px] w-[190px] -skew-y-3 border border-cyan-300/12 bg-gradient-to-br from-cyan-100/18 via-[#08131f]/95 to-black/50 shadow-[0_0_70px_rgba(0,123,255,0.18)]" />
      <div className="absolute bottom-[175px] left-[43%] h-[620px] w-[105px] skew-y-3 border border-cyan-300/14 bg-gradient-to-b from-cyan-100/18 via-[#0d2233]/80 to-black/55 shadow-[0_0_60px_rgba(93,224,255,0.15)]" />
      <div className="absolute bottom-[175px] right-[20%] h-[600px] w-[88px] skew-y-2 border border-cyan-300/12 bg-gradient-to-b from-cyan-100/16 via-[#10283b]/75 to-black/50" />

      <div className="absolute bottom-[78px] left-0 right-0 h-64 bg-[repeating-linear-gradient(0deg,rgba(75,218,255,0.13)_0px,rgba(75,218,255,0.13)_2px,transparent_2px,transparent_19px)] opacity-55 blur-[1px]" />
      <div className="absolute bottom-0 left-0 right-0 h-[260px] bg-gradient-to-t from-black via-black/45 to-transparent" />

      <div className="absolute bottom-[110px] left-[7%] h-36 w-24 rotate-[17deg] border border-cyan-200/20 bg-gradient-to-br from-cyan-200/24 to-transparent shadow-[0_0_28px_rgba(84,222,255,0.13)]" />
      <div className="absolute bottom-[92px] right-[11%] h-48 w-28 rotate-[17deg] border border-cyan-200/20 bg-gradient-to-br from-cyan-200/30 to-transparent shadow-[0_0_34px_rgba(84,222,255,0.16)]" />
      <div className="absolute bottom-[125px] right-[24%] h-24 w-20 rotate-45 border border-cyan-200/16 bg-gradient-to-br from-cyan-200/22 to-transparent" />

      <Card
        variant="glass"
        rounded="xl"
        padding="lg"
        className="absolute bottom-10 left-6 right-6 border-electric-blue/35 bg-[#17333b]/72 shadow-[0_34px_100px_rgba(0,0,0,0.48)] backdrop-blur-[22px] sm:left-auto sm:right-12 sm:w-[560px] lg:bottom-[88px] lg:right-[9%] xl:right-[12%]"
      >
        <div className="mb-8 flex gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-electric-blue" />
          <span className="h-2.5 w-2.5 rounded-full bg-peri-purple" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#33404a]" />
        </div>
        <h2 className="max-w-[470px] font-heading text-[31px] font-extrabold leading-[1.18] tracking-[-0.04em] text-white drop-shadow-[0_2px_0_rgba(0,0,0,0.55)] md:text-[38px]">
          {t('auth.marketingTitle')}
        </h2>
        <p className="mt-6 max-w-[520px] text-[16px] leading-[1.55] text-[#d7dee8] md:text-[18px]">
          {t('auth.marketingDesc')}
        </p>
        <div className="mt-7 flex items-center gap-4 rounded-[16px] border border-white/10 bg-white/7 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#5a647c] text-white">
            <span className="material-symbols-outlined text-[28px]">insights</span>
          </div>
          <div>
            <p className="font-heading text-[12px] font-bold uppercase tracking-[0.15em] text-[#d8dcff]">
              {t('auth.aiInsight')}
            </p>
            <p className="mt-1 text-[15px] leading-snug text-white">
              {t('auth.aiInsightDesc')}
            </p>
          </div>
        </div>
      </Card>
    </section>
  )
}

export default function AuthPage({ mode }: AuthPageProps) {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const loginMutation = useLoginUser()
  const registerMutation = useRegisterUser()
  const googleMutation = useGoogleAuth()
  const isRegister = mode === 'register'
  const [form, setForm] = useState<FormState>(initialForm)
  const [errors, setErrors] = useState<FormErrors>({})
  const googleInitialized = useRef(false)

  const isSubmitting =
    loginMutation.isPending || registerMutation.isPending || googleMutation.isPending

  const copy = useMemo(
    () =>
      isRegister
        ? {
            subtitle: t('auth.registerSubtitle'),
            primaryAction: t('auth.registerAction'),
            footerLead: t('auth.registerFooterLead'),
            footerAction: t('auth.registerFooterAction'),
            footerPath: '/login',
          }
        : {
            subtitle: t('auth.loginSubtitle'),
            primaryAction: t('auth.loginAction'),
            footerLead: t('auth.loginFooterLead'),
            footerAction: t('auth.loginFooterAction'),
            footerPath: '/register',
          },
    [isRegister, t],
  )

  // ── Google Identity Services ──────────────────────────────────────
  const handleGoogleCredential = (response: { credential: string }) => {
    const payload = decodeJwtPayload(response.credential)
    const { email, name, picture, sub } = payload

    if (!email || !name || !sub) {
      toast.error(t('auth.googleFailed'))
      return
    }

    googleMutation.mutate(
      { email, fullName: name, avatarUrl: picture, authProviderId: sub },
      {
        onSuccess: () => {
          toast.success(t('auth.googleSuccess'))
          navigate('/projects')
        },
        onError: (error) => toast.error(getErrorMessage(error, t('auth.somethingWrong'))),
      },
    )
  }

  useEffect(() => {
    const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined
    if (!GOOGLE_CLIENT_ID || googleInitialized.current) return

    const tryInit = () => {
      if (window.google?.accounts?.id) {
        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: handleGoogleCredential,
        })
        googleInitialized.current = true
      }
    }

    tryInit()

    if (!googleInitialized.current) {
      const script = document.querySelector('script[src*="accounts.google.com/gsi/client"]')
      script?.addEventListener('load', tryInit)
      return () => script?.removeEventListener('load', tryInit)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    setErrors({})
    loginMutation.reset()
    registerMutation.reset()
    googleMutation.reset()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode])

  const handleChange = (field: FieldName, value: string) => {
    setForm((current) => ({ ...current, [field]: value }))
    setErrors((current) => ({ ...current, [field]: undefined }))
  }

  const validate = () => {
    const nextErrors: FormErrors = {}
    const email = form.email.trim()

    if (isRegister && !form.fullName.trim()) {
      nextErrors.fullName = t('auth.nameRequired')
    }

    if (!email) {
      nextErrors.email = t('auth.emailRequired')
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      nextErrors.email = t('auth.emailInvalid')
    }

    if (!form.password) {
      nextErrors.password = t('auth.passwordRequired')
    } else if (isRegister && form.password.length < 8) {
      nextErrors.password = t('auth.passwordMinLength')
    }

    if (isRegister && form.confirmPassword !== form.password) {
      nextErrors.confirmPassword = t('auth.passwordsNoMatch')
    }

    return nextErrors
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const nextErrors = validate()
    setErrors(nextErrors)

    if (Object.keys(nextErrors).length > 0) return

    if (isRegister) {
      registerMutation.mutate(
        {
          fullName: form.fullName.trim(),
          email: form.email.trim().toLowerCase(),
          password: form.password,
        },
        {
          onSuccess: () => {
            toast.success(t('auth.accountCreated'))
            navigate('/projects')
          },
          onError: (error) => toast.error(getErrorMessage(error, t('auth.somethingWrong'))),
        },
      )
      return
    }

    loginMutation.mutate(
      { email: form.email.trim().toLowerCase(), password: form.password },
      {
        onSuccess: () => {
          toast.success(t('auth.signInSuccess'))
          navigate('/projects')
        },
        onError: (error) => toast.error(getErrorMessage(error, t('auth.somethingWrong'))),
      },
    )
  }

  const handleGoogleClick = () => {
    const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined

    if (!GOOGLE_CLIENT_ID) {
      toast.info(t('auth.googleNotConfigured'))
      return
    }

    if (!window.google?.accounts?.id) {
      toast.error(t('auth.googleLoading'))
      return
    }

    window.google.accounts.id.prompt()
  }

  return (
    <main className="min-h-screen bg-black text-on-surface">
      <div className="grid min-h-screen lg:grid-cols-[minmax(430px,45vw)_1fr]">
        <section className="relative flex min-h-screen items-center overflow-hidden bg-[#020304] px-6 py-12 sm:px-10 lg:px-16 xl:px-[120px]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_72%_50%,rgba(0,123,255,0.13),transparent_34%),linear-gradient(120deg,#000_0%,#020406_46%,#061222_100%)]" />
          <div className="absolute inset-y-0 right-0 hidden w-px bg-white/5 lg:block" />

          <div className="relative z-10 mx-auto w-full max-w-[420px]">
            <AuthLogo />
            <p className="mt-4 text-[16px] leading-relaxed text-[#d0d4de]">
              {t('auth.smartPlanning')}
            </p>

            <form className="mt-12 flex flex-col gap-4" noValidate onSubmit={handleSubmit}>
              {isRegister && (
                <AuthField
                  id="fullName"
                  autoComplete="name"
                  disabled={isSubmitting}
                  error={errors.fullName}
                  label={t('auth.fullNameLabel')}
                  placeholder="Alex Morgan"
                  type="text"
                  value={form.fullName}
                  onChange={handleChange}
                />
              )}

              <AuthField
                id="email"
                autoComplete="email"
                disabled={isSubmitting}
                error={errors.email}
                label={t('auth.emailLabel')}
                placeholder="name@company.com"
                type="email"
                value={form.email}
                onChange={handleChange}
              />

              <AuthField
                id="password"
                autoComplete={isRegister ? 'new-password' : 'current-password'}
                disabled={isSubmitting}
                error={errors.password}
                label={t('auth.passwordLabel')}
                labelAction={
                  !isRegister ? (
                    <button
                      className="text-[12px] font-semibold tracking-[0.08em] text-electric-blue transition-colors hover:text-primary"
                      type="button"
                      onClick={() => toast.info(t('auth.forgotNotConnected'))}
                    >
                      {t('auth.forgotBtn')}
                    </button>
                  ) : undefined
                }
                placeholder="••••••••"
                type="password"
                value={form.password}
                onChange={handleChange}
              />

              {isRegister && (
                <AuthField
                  id="confirmPassword"
                  autoComplete="new-password"
                  disabled={isSubmitting}
                  error={errors.confirmPassword}
                  label={t('auth.confirmPasswordLabel')}
                  placeholder="••••••••"
                  type="password"
                  value={form.confirmPassword}
                  onChange={handleChange}
                />
              )}

              <Button
                className="mt-3 h-14 w-full rounded-full bg-electric-blue hover:bg-electric-blue/90 text-white font-bold shadow-[0_0_20px_rgba(0,123,255,0.3)] hover:scale-[1.01] disabled:pointer-events-none disabled:opacity-65 transition-all"
                disabled={isSubmitting}
                type="submit"
                variant="ghost"
              >
                <span>{isSubmitting ? t('auth.working') : copy.primaryAction}</span>
                <span className="material-symbols-outlined text-[24px]">arrow_forward</span>
              </Button>
            </form>

            <div className="my-6 flex items-center gap-4">
              <span className="h-px flex-1 bg-white/12" />
              <span className="font-heading text-[11px] font-semibold uppercase tracking-[0.12em] text-[#687184]">
                {t('auth.continueWith')}
              </span>
              <span className="h-px flex-1 bg-white/12" />
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Button
                className="h-[54px] rounded-xl border-white/12 !bg-white/[0.035] !text-white hover:!bg-white/[0.06] disabled:pointer-events-none disabled:opacity-60"
                disabled={isSubmitting}
                type="button"
                variant="secondary"
                onClick={handleGoogleClick}
              >
                <span className="relative h-5 w-5 rounded-[2px] bg-[#151827]">
                  <span className="absolute left-1/2 top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-[#4285f4] border-r-[#fbbc05] border-t-[#ea4335]" />
                </span>
                <span className="text-[16px] font-medium">Google</span>
              </Button>

              <Button
                className="h-[54px] rounded-xl border-white/12 !bg-white/[0.035] !text-white hover:!bg-white/[0.06]"
                type="button"
                variant="secondary"
                onClick={() => toast.info(t('auth.ssoTooltip'))}
              >
                <span className="material-symbols-outlined text-[20px]">corporate_fare</span>
                <span className="text-[16px] font-medium">Enterprise SSO</span>
              </Button>
            </div>

            <p className="mt-12 text-center text-[16px] text-[#d5d8df]">
              {copy.footerLead}{' '}
              <button
                className="font-bold text-[#c7d3ff] transition-colors hover:text-primary"
                type="button"
                onClick={() => navigate(copy.footerPath)}
              >
                {copy.footerAction}
              </button>
            </p>
          </div>
        </section>

        <MarketingScene />
      </div>
    </main>
  )
}
