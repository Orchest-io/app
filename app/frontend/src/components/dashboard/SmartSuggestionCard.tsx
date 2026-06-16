<<<<<<< HEAD
import { useTranslation } from 'react-i18next'
=======
>>>>>>> c4de3810ef7844afb12cec71b8f19dc97aa60bd7
import type { ProjectListItemDto } from '../../pages/Dashboard/dashboard.types'

interface SmartSuggestionCardProps {
  projects: ProjectListItemDto[]
}

/**
 * Derives a contextual AI suggestion from live project data.
 * No API call — synthesizes insight from already-cached project state.
 */
export default function SmartSuggestionCard({ projects }: SmartSuggestionCardProps) {
<<<<<<< HEAD
  const { t } = useTranslation()

=======
>>>>>>> c4de3810ef7844afb12cec71b8f19dc97aa60bd7
  const atRisk = projects.find((p) => p.status === 'at-risk' || p.status === 'delayed')
  const highPriority = projects.find(
    (p) => p.priority === 'high' && (p.status === 'active' || p.status === 'on-track'),
  )
  const nearDeadline = projects
    .filter((p) => p.endDate)
    .sort(
      (a, b) =>
        new Date(a.endDate!).getTime() - new Date(b.endDate!).getTime(),
    )
    .find((p) => {
      const days = Math.ceil(
        (new Date(p.endDate!).getTime() - Date.now()) / (1000 * 60 * 60 * 24),
      )
      return days >= 0 && days <= 7
    })

<<<<<<< HEAD
  let suggestion = t('dashboard.workspaceHealthy')

  if (atRisk) {
    suggestion = t('dashboard.atRiskSuggestion', { name: atRisk.name })
=======
  let suggestion =
    'Your workspace is healthy. Consider reviewing milestone targets for upcoming quarters.'

  if (atRisk) {
    suggestion = `"${atRisk.name}" is showing risk signals. I recommend reallocating capacity and reviewing blockers immediately.`
>>>>>>> c4de3810ef7844afb12cec71b8f19dc97aa60bd7
  } else if (nearDeadline) {
    const days = Math.ceil(
      (new Date(nearDeadline.endDate!).getTime() - Date.now()) / (1000 * 60 * 60 * 24),
    )
<<<<<<< HEAD
    suggestion = t('dashboard.nearDeadlineSuggestion', { name: nearDeadline.name, count: days })
  } else if (highPriority) {
    suggestion = t('dashboard.highPrioritySuggestion', { name: highPriority.name })
=======
    suggestion = `"${nearDeadline.name}" is due in ${days} day${days !== 1 ? 's' : ''}. Confirm all tasks are assigned and unblocked.`
  } else if (highPriority) {
    suggestion = `I recommend focusing on "${highPriority.name}" for maximum velocity. It's high priority and currently active.`
>>>>>>> c4de3810ef7844afb12cec71b8f19dc97aa60bd7
  }

  return (
    <div className="p-4 rounded-xl bg-electric-blue/5 border border-electric-blue/15">
      <p className="text-[10px] font-heading font-bold uppercase tracking-widest text-electric-blue mb-2">
<<<<<<< HEAD
        {t('dashboard.smartSuggestion')}
      </p>
      <p className="text-sm text-on-surface leading-relaxed">{suggestion}</p>
      <button className="mt-3 w-full py-1.5 px-3 rounded-lg bg-surface-container-high border border-border-low text-xs font-semibold text-on-surface hover:bg-surface-container-highest transition-colors cursor-pointer">
        {t('dashboard.applyRecommendation')}
=======
        Smart Suggestion
      </p>
      <p className="text-sm text-on-surface leading-relaxed">{suggestion}</p>
      <button className="mt-3 w-full py-1.5 px-3 rounded-lg bg-surface-container-high border border-border-low text-xs font-semibold text-on-surface hover:bg-surface-container-highest transition-colors cursor-pointer">
        Apply Recommendation
>>>>>>> c4de3810ef7844afb12cec71b8f19dc97aa60bd7
      </button>
    </div>
  )
}
