import { useState } from 'react'
import type { FormEvent } from 'react'
import { toast } from 'sonner'
import { Button, Card, Input, Toggle, Select } from '../../components/ui'
import { useMe, useUpdateMe, useUpdateMySettings, useChangePassword } from '../../hooks/useSettings'
import { useAiUsage } from '../../hooks/useAiUsage'

// ─── Section IDs ──────────────────────────────────────────────────
type SectionId =
  | 'profile'
  | 'workspace'
  | 'notifications'
  | 'ai'
  | 'security'
  | 'billing'
  | 'api'
  | 'activity'

const NAV_ITEMS: { id: SectionId; label: string; icon: string }[] = [
  { id: 'profile',       label: 'Profile',            icon: 'person'            },
  { id: 'workspace',     label: 'Workspace',          icon: 'table_chart'       },
  { id: 'notifications', label: 'Notifications',      icon: 'notifications'     },
  { id: 'ai',            label: 'AI Preferences',     icon: 'auto_awesome'      },
  { id: 'security',      label: 'Security & Sessions',icon: 'shield'            },
  { id: 'billing',       label: 'Billing',            icon: 'credit_card'       },
  { id: 'api',           label: 'API Integrations',   icon: 'data_object'       },
  { id: 'activity',      label: 'Activity Logs',      icon: 'history'           },
]

// ─── Shared section header ─────────────────────────────────────────
function SectionHeader({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="mb-8">
      <h2 className="font-heading text-[26px] font-semibold text-on-surface">{title}</h2>
      <p className="text-sm text-on-surface-variant mt-1 leading-relaxed">{desc}</p>
    </div>
  )
}

// ─── Profile Section ──────────────────────────────────────────────
function ProfileSection() {
  const { data: user, isLoading } = useMe()
  const updateMe = useUpdateMe()

  const [fullName, setFullName] = useState('')
  const [roleTitle, setRoleTitle] = useState('')
  const [hasInit, setHasInit] = useState(false)

  if (!hasInit && user) {
    setFullName(user.fullName ?? '')
    setRoleTitle((user as any).roleTitle ?? '')
    setHasInit(true)
  }

  const handleSave = (e: FormEvent) => {
    e.preventDefault()
    if (!fullName.trim()) { toast.error('Full name is required.'); return }
    updateMe.mutate(
      { fullName: fullName.trim(), ...(roleTitle ? { roleTitle } : {}) },
      {
        onSuccess: () => toast.success('Profile updated.'),
        onError: () => toast.error('Failed to update profile.'),
      },
    )
  }

  return (
    <div>
      <SectionHeader title="Profile" desc="Manage your personal information and public identity." />

      {/* Avatar */}
      <Card className="mb-6">
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-electric-blue to-peri-purple flex items-center justify-center text-white font-heading font-bold text-2xl shrink-0">
            {user?.fullName?.split(' ').map((n) => n[0]).join('').slice(0, 2) ?? '?'}
          </div>
          <div>
            <p className="font-heading text-base font-semibold text-on-surface">
              {isLoading ? 'Loading...' : (user?.fullName ?? '—')}
            </p>
            <p className="text-xs text-on-surface-variant mt-0.5">{user?.email ?? ''}</p>
            <Button size="sm" variant="secondary" className="mt-3" onClick={() => toast.info('Avatar upload coming soon.')}>
              Change Photo
            </Button>
          </div>
        </div>
      </Card>

      {/* Form */}
      <Card>
        <form className="flex flex-col gap-5" onSubmit={handleSave}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Input
              label="Full Name"
              icon="person"
              placeholder="Your full name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              disabled={updateMe.isPending}
            />
            <Input
              label="Email Address"
              icon="mail"
              placeholder="your@email.com"
              value={user?.email ?? ''}
              disabled
              className="opacity-60"
            />
          </div>
          <Input
            label="Role / Title"
            icon="badge"
            placeholder="e.g. Senior Engineer, Product Lead"
            value={roleTitle}
            onChange={(e) => setRoleTitle(e.target.value)}
            disabled={updateMe.isPending}
          />
          <div className="flex justify-end">
            <Button type="submit" disabled={updateMe.isPending}>
              {updateMe.isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}

// ─── Workspace Section ────────────────────────────────────────────
function WorkspaceSection() {
  const { data: user } = useMe()
  const updateSettings = useUpdateMySettings()

  const settings = (user as any)?.settings

  return (
    <div>
      <SectionHeader title="Workspace" desc="Configure your workspace appearance and language preferences." />

      <Card className="flex flex-col gap-6">
        <Select
          label="Theme"
          value={settings?.theme ?? 'dark'}
          onChange={(e) =>
            updateSettings.mutate(
              { theme: e.target.value as any },
              { onSuccess: () => toast.success('Theme updated.') },
            )
          }
          options={[
            { value: 'dark',   label: 'Dark (Default)' },
            { value: 'light',  label: 'Light'          },
            { value: 'system', label: 'System'         },
          ]}
        />

        <Select
          label="Language"
          value={settings?.language ?? 'en'}
          onChange={(e) =>
            updateSettings.mutate(
              { language: e.target.value },
              { onSuccess: () => toast.success('Language updated.') },
            )
          }
          options={[
            { value: 'en', label: 'English'  },
            { value: 'ar', label: 'Arabic'   },
            { value: 'fr', label: 'French'   },
            { value: 'de', label: 'German'   },
            { value: 'es', label: 'Spanish'  },
          ]}
        />
      </Card>
    </div>
  )
}

// ─── Notifications Section ────────────────────────────────────────
function NotificationsSection() {
  const { data: user } = useMe()
  const updateSettings = useUpdateMySettings()
  const settings = (user as any)?.settings

  const toggle = (key: 'emailNotifications' | 'pushNotifications', val: boolean) => {
    updateSettings.mutate(
      { [key]: val },
      { onSuccess: () => toast.success('Preference saved.') },
    )
  }

  const rows = [
    { key: 'emailNotifications' as const,  label: 'Email Notifications',  desc: 'Receive updates and alerts via email.',           icon: 'mail'          },
    { key: 'pushNotifications'  as const,  label: 'Push Notifications',   desc: 'Browser push alerts for real-time activity.',    icon: 'notifications' },
  ]

  return (
    <div>
      <SectionHeader title="Notifications" desc="Choose how and when you want to be notified." />

      <Card className="flex flex-col divide-y divide-border-low">
        {rows.map(({ key, label, desc, icon }) => (
          <div key={key} className="flex items-center justify-between py-5 first:pt-0 last:pb-0">
            <div className="flex items-start gap-4">
              <div className="w-9 h-9 rounded-lg bg-surface-container-high flex items-center justify-center text-on-surface-variant">
                <span className="material-symbols-outlined text-[20px]">{icon}</span>
              </div>
              <div>
                <p className="font-heading text-sm font-semibold text-on-surface">{label}</p>
                <p className="text-xs text-on-surface-variant mt-0.5">{desc}</p>
              </div>
            </div>
            <Toggle
              checked={settings?.[key] ?? true}
              onChange={(e) => toggle(key, e.target.checked)}
              disabled={updateSettings.isPending}
            />
          </div>
        ))}
      </Card>

      {/* Weekly Reports */}
      <Card className="mt-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-heading text-sm font-semibold text-on-surface">Weekly Reports</p>
            <p className="text-xs text-on-surface-variant mt-0.5">Get a digest of your team's performance every Monday.</p>
          </div>
          <Toggle
            checked={settings?.weeklyReports ?? false}
            onChange={(e) =>
              updateSettings.mutate(
                { weeklyReports: e.target.checked },
                { onSuccess: () => toast.success('Preference saved.') },
              )
            }
            disabled={updateSettings.isPending}
          />
        </div>
      </Card>
    </div>
  )
}

// ─── AI Preferences Section ───────────────────────────────────────
function AiSection() {
  const { data: user } = useMe()
  const updateSettings = useUpdateMySettings()
  const { data: aiUsage, isLoading: usageLoading } = useAiUsage()
  const settings = (user as any)?.settings

  const rows = [
    { key: 'aiSuggestions', label: 'AI Task Suggestions',   desc: 'Let the AI recommend task assignments and priorities.',       icon: 'auto_awesome' },
    { key: 'aiRisk',        label: 'Risk Prediction Alerts', desc: 'Get notified when the AI detects project risk signals.',      icon: 'warning'      },
    { key: 'aiCopilot',     label: 'Copilot Briefings',      desc: 'Receive daily AI-generated summaries of workspace activity.', icon: 'smart_toy'    },
  ]

  // Calculate usage percentage
  const usagePercent = aiUsage ? Math.round((aiUsage.used / aiUsage.limit) * 100) : 0
  const usageColor = usagePercent >= 100 ? 'text-error' : usagePercent >= 80 ? 'text-amber-400' : 'text-emerald-400'
  const barColor = usagePercent >= 100 ? 'bg-error' : usagePercent >= 80 ? 'bg-amber-400' : 'bg-emerald-400'

  return (
    <div>
      <SectionHeader title="AI Preferences" desc="Control how the AI copilot interacts with your workspace." />

      {/* AI Usage Counter Card */}
      <Card className="mb-6 bg-peri-purple/5 border-peri-purple/20">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-peri-purple/15 flex items-center justify-center text-peri-purple shrink-0">
              <span className="material-symbols-outlined text-[22px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                psychology
              </span>
            </div>
            <div>
              <p className="font-heading text-sm font-semibold text-on-surface">AI Project Planning</p>
              <p className="text-xs text-on-surface-variant mt-0.5">Monthly usage limit</p>
            </div>
          </div>
          {aiUsage && (
            <span className={`px-2.5 py-1 rounded-full ${usagePercent >= 100 ? 'bg-error/10 text-error' : 'bg-emerald-500/10 text-emerald-400'} text-[10px] font-heading font-bold uppercase tracking-wider shrink-0`}>
              {aiUsage.canUse ? 'Available' : 'Limit Reached'}
            </span>
          )}
        </div>

        {usageLoading ? (
          <div className="h-16 flex items-center justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-peri-purple"></div>
          </div>
        ) : aiUsage ? (
          <>
            <div className="flex items-end justify-between mb-2">
              <p className="text-2xl font-heading font-bold text-on-surface">
                {aiUsage.used} <span className="text-sm text-on-surface-variant font-normal">/ {aiUsage.limit}</span>
              </p>
              <p className={`text-xs font-semibold ${usageColor}`}>
                {usagePercent}% used
              </p>
            </div>
            <div className="w-full h-2 bg-surface-container-low rounded-full overflow-hidden">
              <div
                className={`h-full ${barColor} transition-all duration-300 rounded-full`}
                style={{ width: `${Math.min(usagePercent, 100)}%` }}
              />
            </div>
            <p className="text-xs text-on-surface-variant mt-3">
              {aiUsage.canUse 
                ? `${aiUsage.limit - aiUsage.used} AI plans remaining this month` 
                : `Resets on ${new Date(aiUsage.resetsAt).toLocaleDateString()}`
              }
            </p>
          </>
        ) : (
          <p className="text-xs text-on-surface-variant">Failed to load usage data</p>
        )}
      </Card>

      {/* AI Toggles */}
      <Card className="flex flex-col divide-y divide-border-low mb-6">
        {rows.map(({ key, label, desc, icon }) => (
          <div key={key} className="flex items-center justify-between py-5 first:pt-0 last:pb-0">
            <div className="flex items-start gap-4">
              <div className="w-9 h-9 rounded-lg bg-peri-purple/10 flex items-center justify-center text-peri-purple">
                <span className="material-symbols-outlined text-[20px]">{icon}</span>
              </div>
              <div>
                <p className="font-heading text-sm font-semibold text-on-surface">{label}</p>
                <p className="text-xs text-on-surface-variant mt-0.5">{desc}</p>
              </div>
            </div>
            <Toggle
              checked={key === 'aiSuggestions' ? (settings?.aiSuggestions ?? true) : true}
              onChange={(e) => {
                if (key === 'aiSuggestions') {
                  updateSettings.mutate(
                    { aiSuggestions: e.target.checked },
                    { onSuccess: () => toast.success('AI preference saved.') },
                  )
                } else {
                  toast.info('This preference is coming soon.')
                }
              }}
              disabled={updateSettings.isPending}
            />
          </div>
        ))}
      </Card>

      {/* AI model info */}
      <Card className="flex items-center gap-4 bg-electric-blue/5 border-electric-blue/20">
        <div className="w-10 h-10 rounded-full bg-electric-blue/15 flex items-center justify-center text-electric-blue shrink-0">
          <span className="material-symbols-outlined text-[22px]" style={{ fontVariationSettings: "'FILL' 1" }}>
            hub
          </span>
        </div>
        <div>
          <p className="font-heading text-sm font-semibold text-on-surface">Powered by OpenAI</p>
          <p className="text-xs text-on-surface-variant mt-0.5">Using GPT-5-mini and GPT-4o-mini models for intelligent project planning.</p>
        </div>
        <span className="ml-auto px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-heading font-bold uppercase tracking-wider shrink-0">
          Active
        </span>
      </Card>
    </div>
  )
}

// ─── Security Section ─────────────────────────────────────────────
function SecuritySection() {
  const { data: user } = useMe()
  const changePassword = useChangePassword()
  const updateSettings = useUpdateMySettings()
  const settings = (user as any)?.settings

  const [currentPassword, setCurrentPassword]   = useState('')
  const [newPassword, setNewPassword]           = useState('')
  const [confirmPassword, setConfirmPassword]   = useState('')

  const handleChangePassword = (e: FormEvent) => {
    e.preventDefault()
    if (!newPassword || newPassword.length < 8) {
      toast.error('New password must be at least 8 characters.')
      return
    }
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match.')
      return
    }
    changePassword.mutate(
      { currentPassword, newPassword },
      {
        onSuccess: () => {
          toast.success('Password updated successfully.')
          setCurrentPassword('')
          setNewPassword('')
          setConfirmPassword('')
        },
        onError: () => toast.error('Failed to update password. Check your current password.'),
      },
    )
  }

  const SESSIONS = [
    { device: 'Chrome on Windows',  location: 'Cairo, EG',        ip: '197.32.1.45',  current: true  },
    { device: 'Mobile App (iOS)',    location: 'Cairo, EG',        ip: '197.32.1.46',  current: false },
  ]

  return (
    <div>
      <SectionHeader title="Security & Sessions" desc="Manage your account protection, active devices, and sign-in methods." />

      {/* 2FA + Password cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <Card className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-electric-blue/10 flex items-center justify-center text-electric-blue">
              <span className="material-symbols-outlined text-[22px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                phone_iphone
              </span>
            </div>
            <div className="flex-1">
              <p className="font-heading text-sm font-bold text-on-surface">Two-Factor Authentication</p>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-heading font-bold uppercase tracking-wider">
              {settings?.twoFactorEnabled ? 'Active' : 'Off'}
            </span>
          </div>
          <p className="text-xs text-on-surface-variant leading-relaxed">
            {settings?.twoFactorEnabled
              ? 'Two-step verification is enabled. Your account is protected by an additional layer of security.'
              : 'Add an extra layer of protection to your account with 2FA.'}
          </p>
          <Button
            size="sm"
            variant="secondary"
            onClick={() =>
              updateSettings.mutate(
                { twoFactorEnabled: !settings?.twoFactorEnabled },
                { onSuccess: () => toast.success('2FA preference updated.') },
              )
            }
          >
            {settings?.twoFactorEnabled ? 'Disable 2FA' : 'Enable 2FA'}
          </Button>
        </Card>

        <Card className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-surface-container-high flex items-center justify-center text-on-surface-variant">
              <span className="material-symbols-outlined text-[22px]">key</span>
            </div>
            <p className="font-heading text-sm font-bold text-on-surface">Password Management</p>
          </div>
          <p className="text-xs text-on-surface-variant leading-relaxed">
            Keep your password strong. We recommend updating it every 90 days.
          </p>
          <Button size="sm" variant="secondary" onClick={() => document.getElementById('change-password-form')?.scrollIntoView({ behavior: 'smooth' })}>
            Change Password
          </Button>
        </Card>
      </div>

      {/* Change password form */}
      <Card className="mb-6" id="change-password-form">
        <h3 className="font-heading text-base font-semibold text-on-surface mb-5">Change Password</h3>
        <form className="flex flex-col gap-4" onSubmit={handleChangePassword}>
          <Input
            label="Current Password"
            icon="lock"
            type="password"
            placeholder="••••••••"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            disabled={changePassword.isPending}
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="New Password"
              icon="lock_reset"
              type="password"
              placeholder="Min. 8 characters"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              disabled={changePassword.isPending}
            />
            <Input
              label="Confirm New Password"
              icon="lock_reset"
              type="password"
              placeholder="Repeat password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={changePassword.isPending}
              error={confirmPassword && confirmPassword !== newPassword ? 'Passwords do not match.' : undefined}
            />
          </div>
          <div className="flex justify-end">
            <Button type="submit" disabled={changePassword.isPending}>
              {changePassword.isPending ? 'Updating...' : 'Update Password'}
            </Button>
          </div>
        </form>
      </Card>

      {/* Active sessions */}
      <Card>
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-heading text-base font-semibold text-on-surface">Active Sessions</h3>
          <button
            className="text-xs font-semibold text-error hover:underline cursor-pointer"
            onClick={() => toast.info('All other sessions revoked.')}
          >
            Revoke all other sessions
          </button>
        </div>
        <div className="flex flex-col gap-3">
          {SESSIONS.map((s) => (
            <div
              key={s.device}
              className={`flex items-center justify-between p-4 rounded-lg border ${
                s.current ? 'border-electric-blue/30 bg-electric-blue/5' : 'border-border-low bg-surface-container-low'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-on-surface-variant text-[22px]">
                  {s.device.includes('Mobile') ? 'smartphone' : 'computer'}
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-heading text-sm font-semibold text-on-surface">{s.device}</p>
                    {s.current && (
                      <span className="px-1.5 py-0.5 rounded bg-electric-blue/15 text-electric-blue text-[9px] font-heading font-bold uppercase tracking-wider">
                        Current
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-on-surface-variant mt-0.5">{s.location} · {s.ip}</p>
                </div>
              </div>
              {s.current ? (
                <span className="text-xs text-emerald-400 font-medium">Active now</span>
              ) : (
                <Button size="sm" variant="secondary" onClick={() => toast.success(`Session revoked.`)}>
                  Revoke
                </Button>
              )}
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}

// ─── Billing Section ──────────────────────────────────────────────
function BillingSection() {
  return (
    <div>
      <SectionHeader title="Billing" desc="Manage your subscription, payment methods, and invoices." />

      {/* Current plan */}
      <Card className="mb-6 relative overflow-hidden border-electric-blue/25 bg-electric-blue/5">
        <div className="absolute top-0 right-0 w-48 h-48 bg-electric-blue/10 blur-[60px] pointer-events-none" />
        <div className="flex items-start justify-between">
          <div>
            <span className="px-2.5 py-0.5 rounded-full bg-electric-blue/20 text-electric-blue text-[10px] font-heading font-bold uppercase tracking-wider">
              Current Plan
            </span>
            <h3 className="font-heading text-2xl font-extrabold text-on-surface mt-3">Pro Plan</h3>
            <p className="text-xs text-on-surface-variant mt-1">$29 / month · Renews on Jul 3, 2026</p>
            <ul className="mt-4 space-y-1.5">
              {['Up to 25 members', 'Unlimited projects', 'Full AI copilot', 'Risk prediction'].map((f) => (
                <li key={f} className="flex items-center gap-2 text-xs text-on-surface-variant">
                  <span className="material-symbols-outlined text-electric-blue text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                  {f}
                </li>
              ))}
            </ul>
          </div>
          <Button variant="secondary" onClick={() => toast.info('Plan management coming soon.')}>
            Manage Plan
          </Button>
        </div>
      </Card>

      {/* Payment method */}
      <Card className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-heading text-base font-semibold text-on-surface">Payment Method</h3>
          <Button size="sm" variant="secondary" onClick={() => toast.info('Payment update coming soon.')}>
            Update
          </Button>
        </div>
        <div className="flex items-center gap-4 p-4 rounded-lg bg-surface-container-low border border-border-low">
          <div className="w-10 h-7 rounded bg-gradient-to-r from-blue-600 to-blue-400 flex items-center justify-center">
            <span className="text-white text-[9px] font-heading font-bold">VISA</span>
          </div>
          <div>
            <p className="text-sm font-medium text-on-surface">•••• •••• •••• 4242</p>
            <p className="text-xs text-on-surface-variant mt-0.5">Expires 08/27</p>
          </div>
        </div>
      </Card>

      {/* Invoices */}
      <Card>
        <h3 className="font-heading text-base font-semibold text-on-surface mb-4">Recent Invoices</h3>
        <div className="flex flex-col divide-y divide-border-low">
          {[
            { date: 'Jun 3, 2026', amount: '$29.00', status: 'Paid' },
            { date: 'May 3, 2026', amount: '$29.00', status: 'Paid' },
            { date: 'Apr 3, 2026', amount: '$29.00', status: 'Paid' },
          ].map(({ date, amount, status }) => (
            <div key={date} className="flex items-center justify-between py-3.5">
              <div>
                <p className="text-sm text-on-surface font-medium">{date}</p>
                <p className="text-xs text-on-surface-variant mt-0.5">{amount}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-heading font-bold">
                  {status}
                </span>
                <button className="text-electric-blue text-xs hover:underline cursor-pointer" onClick={() => toast.info('Invoice download coming soon.')}>
                  Download
                </button>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}

// ─── API Integrations Section ─────────────────────────────────────
function ApiSection() {
  const INTEGRATIONS = [
    { name: 'GitHub',  icon: 'code',         connected: true,  desc: 'Sync repositories and pull requests.' },
    { name: 'Jira',    icon: 'view_kanban',   connected: false, desc: 'Import and sync Jira issues.'         },
    { name: 'Slack',   icon: 'forum',         connected: true,  desc: 'Send notifications to Slack channels.' },
    { name: 'Notion',  icon: 'article',       connected: false, desc: 'Link Notion pages to tasks.'          },
  ]

  return (
    <div>
      <SectionHeader title="API Integrations" desc="Connect third-party tools to your Orchist workspace." />

      {/* API Key */}
      <Card className="mb-6">
        <h3 className="font-heading text-base font-semibold text-on-surface mb-4">Personal API Key</h3>
        <div className="flex items-center gap-3">
          <div className="flex-1 px-4 py-2.5 bg-surface-container-low border border-border-low rounded-md font-mono text-sm text-on-surface-variant truncate">
            sk-orchist-••••••••••••••••••••••••••••
          </div>
          <Button size="sm" variant="secondary" onClick={() => toast.success('API key copied!')}>
            <span className="material-symbols-outlined text-[16px]">content_copy</span>
            Copy
          </Button>
          <Button size="sm" variant="secondary" onClick={() => toast.info('API key regenerated.')}>
            <span className="material-symbols-outlined text-[16px]">refresh</span>
            Regenerate
          </Button>
        </div>
        <p className="text-xs text-on-surface-variant mt-3">Keep this key secret. It grants full API access to your workspace.</p>
      </Card>

      {/* Connected apps */}
      <Card>
        <h3 className="font-heading text-base font-semibold text-on-surface mb-5">Connected Apps</h3>
        <div className="flex flex-col gap-4">
          {INTEGRATIONS.map(({ name, icon, connected, desc }) => (
            <div key={name} className="flex items-center justify-between p-4 rounded-lg bg-surface-container-low border border-border-low">
              <div className="flex items-center gap-4">
                <div className="w-9 h-9 rounded-lg bg-surface-container-high flex items-center justify-center text-on-surface-variant">
                  <span className="material-symbols-outlined text-[20px]">{icon}</span>
                </div>
                <div>
                  <p className="font-heading text-sm font-semibold text-on-surface">{name}</p>
                  <p className="text-xs text-on-surface-variant mt-0.5">{desc}</p>
                </div>
              </div>
              <Button
                size="sm"
                variant={connected ? 'secondary' : 'primary'}
                onClick={() => toast.info(`${name} integration coming soon.`)}
              >
                {connected ? 'Disconnect' : 'Connect'}
              </Button>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}

// ─── Activity Logs Section ────────────────────────────────────────
function ActivitySection() {
  const LOGS = [
    { action: 'Signed in',             time: '2 minutes ago',   icon: 'login',          color: 'text-electric-blue' },
    { action: 'Updated profile name',  time: '1 hour ago',      icon: 'edit',           color: 'text-peri-purple'   },
    { action: 'Created project "Q4"',  time: '3 hours ago',     icon: 'add_circle',     color: 'text-emerald-400'   },
    { action: 'Password changed',      time: 'Yesterday',       icon: 'lock_reset',     color: 'text-amber-400'     },
    { action: 'Invited team member',   time: '2 days ago',      icon: 'person_add',     color: 'text-peri-purple'   },
    { action: 'Connected GitHub',      time: '5 days ago',      icon: 'code',           color: 'text-electric-blue' },
    { action: 'Signed in from mobile', time: '1 week ago',      icon: 'smartphone',     color: 'text-on-surface-variant' },
  ]

  return (
    <div>
      <SectionHeader title="Activity Logs" desc="A record of all important actions performed in your account." />

      <Card>
        <div className="flex flex-col divide-y divide-border-low">
          {LOGS.map(({ action, time, icon, color }, i) => (
            <div key={i} className="flex items-center gap-4 py-4 first:pt-0 last:pb-0">
              <div className="w-9 h-9 rounded-full bg-surface-container-high flex items-center justify-center shrink-0">
                <span className={`material-symbols-outlined text-[18px] ${color}`}>{icon}</span>
              </div>
              <div className="flex-1">
                <p className="text-sm text-on-surface font-medium">{action}</p>
              </div>
              <span className="text-xs text-on-surface-variant whitespace-nowrap">{time}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}

// ─── SECTION MAP ──────────────────────────────────────────────────
const SECTION_MAP: Record<SectionId, React.ReactNode> = {
  profile:       <ProfileSection />,
  workspace:     <WorkspaceSection />,
  notifications: <NotificationsSection />,
  ai:            <AiSection />,
  security:      <SecuritySection />,
  billing:       <BillingSection />,
  api:           <ApiSection />,
  activity:      <ActivitySection />,
}

// ─── Main Settings Page ───────────────────────────────────────────
export default function Settings() {
  const [active, setActive] = useState<SectionId>('profile')

  return (
    <div className="max-w-[1100px] mx-auto py-8">
      {/* Page header */}
      <div className="mb-8">
        <h1 className="font-heading text-[32px] font-semibold text-on-surface">Settings</h1>
        <p className="text-sm text-on-surface-variant mt-1">
          Manage your account, preferences, and workspace configuration.
        </p>
      </div>

      <div className="flex gap-8 items-start">
        {/* Left nav */}
        <aside className="w-[220px] shrink-0">
          <p className="font-heading text-[10px] uppercase tracking-widest text-on-surface-variant font-bold mb-3 px-2">
            Categories
          </p>
          <nav className="flex flex-col gap-0.5">
            {NAV_ITEMS.map(({ id, label, icon }) => (
              <button
                key={id}
                onClick={() => setActive(id)}
                className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 cursor-pointer text-left ${
                  active === id
                    ? 'bg-secondary-container text-on-secondary-container'
                    : 'text-on-surface-variant hover:bg-surface-glass hover:text-on-surface'
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">{icon}</span>
                {label}
              </button>
            ))}
          </nav>
        </aside>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {SECTION_MAP[active]}
        </div>
      </div>
    </div>
  )
}
