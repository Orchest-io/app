import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'

/**
 * Focus Insight card — tracks focus state locally.
 * The timer counts down from a chosen duration and "mutes" non-urgent
 * notifications contextually (purely UI state, no backend call needed).
 */
export default function FocusInsightCard() {
  const { t } = useTranslation()
  const [focusMinutes, setFocusMinutes] = useState<number | null>(null)
  const [remaining, setRemaining] = useState(0)

  // Countdown tick
  useEffect(() => {
    if (focusMinutes === null) return
    setRemaining(focusMinutes * 60)
    const interval = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval)
          setFocusMinutes(null)
          return 0
        }
        return prev - 1
      })
    }, 1_000)
    return () => clearInterval(interval)
  }, [focusMinutes])

  const displayMinutes = Math.floor(remaining / 60)
  const displaySeconds = remaining % 60
  const progress = focusMinutes ? ((focusMinutes * 60 - remaining) / (focusMinutes * 60)) * 100 : 0

  const DURATIONS = [25, 45, 60]

  return (
    <div className="p-4 rounded-xl bg-peri-purple/5 border border-peri-purple/15">
      <p className="text-[10px] font-heading font-bold uppercase tracking-widest text-peri-purple mb-2">
        {t('dashboard.focusInsight')}
      </p>

      {focusMinutes === null ? (
        <>
          <p className="text-sm text-on-surface leading-relaxed mb-3">
            {t('dashboard.focusInsightDesc')}
          </p>
          <div className="flex gap-2">
            {DURATIONS.map((min) => (
              <button
                key={min}
                onClick={() => setFocusMinutes(min)}
                className="flex-1 py-1.5 rounded-lg bg-surface-container-high border border-border-low text-xs font-semibold text-on-surface-variant hover:text-on-surface hover:border-peri-purple/30 transition-all cursor-pointer"
              >
                {min}m
              </button>
            ))}
          </div>
        </>
      ) : (
        <>
          <p className="text-sm text-on-surface leading-relaxed mb-3">
            {t('dashboard.flowStateActive')}{' '}
            <span className="text-peri-purple font-semibold">{focusMinutes} {t('dashboard.minutes')}</span>.
          </p>

          {/* Progress bar */}
          <div className="w-full h-1.5 bg-surface-container rounded-full overflow-hidden mb-2">
            <div
              className="h-full bg-peri-purple rounded-full transition-[width] duration-1000"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-peri-purple font-semibold">
              {String(displayMinutes).padStart(2, '0')}:{String(displaySeconds).padStart(2, '0')}
            </span>
            <button
              onClick={() => setFocusMinutes(null)}
              className="text-[11px] text-on-surface-variant hover:text-error transition-colors cursor-pointer"
            >
              {t('wizard.cancel')}
            </button>
          </div>
        </>
      )}
    </div>
  )
}
