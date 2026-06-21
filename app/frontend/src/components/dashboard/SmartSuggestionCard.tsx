import { useTranslation } from 'react-i18next'
import Card from '../ui/Card/Card'
import { useAIInsights } from '../../hooks/useAIInsights'

interface SmartSuggestionCardProps {
  projects: any[];
  isLoading: boolean;
}

/**
 * AI-powered smart suggestions card
 * Shows AI-generated insights - INFORMATIONAL ONLY (non-clickable)
 */
export default function SmartSuggestionCard({ isLoading: projectsLoading }: SmartSuggestionCardProps) {
  const { t } = useTranslation()

  // Fetch AI insights
  const { data: aiInsights, isLoading: aiLoading, error: aiError } = useAIInsights()

  const isLoading = projectsLoading || aiLoading

  // Loading state
  if (isLoading) {
    return (
      <Card className="flex flex-col h-full" padding="md">
        <div className="animate-pulse">
          <div className="h-4 bg-surface-container rounded w-32 mb-4" />
          <div className="h-20 bg-surface-container rounded mb-4" />
          <div className="h-9 bg-surface-container rounded" />
        </div>
      </Card>
    )
  }

  // Error or no API key state
  if (aiError || !aiInsights) {
    return (
      <Card className="flex flex-col h-full" padding="md">
        <div className="flex items-center gap-2 mb-4">
          <span
            className="material-symbols-outlined text-peri-purple text-[18px]"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            auto_awesome
          </span>
          <h3 className="font-heading text-base font-semibold text-on-surface">
            {t('dashboard.smartSuggestion')}
          </h3>
        </div>
        <div className="flex-1 flex items-center justify-center text-center py-8">
          <div className="max-w-xs">
            <span className="material-symbols-outlined text-[40px] text-on-surface-variant/30 mb-3 block">
              psychology_alt
            </span>
            <p className="text-sm font-semibold text-on-surface mb-1">
              AI Insights Unavailable
            </p>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              OpenAI API key is not configured or AI service is unavailable. Please check your environment configuration.
            </p>
          </div>
        </div>
      </Card>
    )
  }

  const primaryRec = aiInsights.recommendations[0]
  if (!primaryRec) {
    return null
  }

  // Map priority to colors
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return { color: 'text-error', bgColor: 'bg-error/5' }
      case 'medium':
        return { color: 'text-amber-500', bgColor: 'bg-amber-500/5' }
      case 'low':
        return { color: 'text-electric-blue', bgColor: 'bg-electric-blue/5' }
      default:
        return { color: 'text-peri-purple', bgColor: 'bg-peri-purple/5' }
    }
  }

  const primaryColors = getPriorityColor(primaryRec.priority)

  return (
    <Card className="flex flex-col h-full" padding="md">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span
            className="material-symbols-outlined text-peri-purple text-[18px]"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            auto_awesome
          </span>
          <h3 className="font-heading text-base font-semibold text-on-surface">
            {t('dashboard.smartSuggestion')}
          </h3>
        </div>
        <span className="px-2 py-0.5 rounded-full bg-electric-blue/10 border border-electric-blue/20 text-electric-blue text-[10px] font-heading font-bold uppercase tracking-wider">
          AI
        </span>
      </div>

      {/* Primary Recommendation - INFORMATIONAL ONLY */}
      <div className={`flex-1 rounded-xl p-4 border ${primaryColors.bgColor} ${primaryColors.color} border-opacity-20 mb-3`}>
        <div className="flex items-start gap-3">
          <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${primaryColors.bgColor} border ${primaryColors.color} border-opacity-30`}>
            <span
              className={`material-symbols-outlined text-[20px] ${primaryColors.color}`}
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              {primaryRec.priority === 'high' ? 'warning' : primaryRec.priority === 'medium' ? 'info' : 'tips_and_updates'}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-heading font-bold text-sm text-on-surface mb-1">
              {primaryRec.title}
            </p>
            <p className="text-xs text-on-surface-variant leading-relaxed mb-2">
              {primaryRec.description}
            </p>
            <div className="flex items-start gap-1.5 text-[11px] text-on-surface-variant/70 italic mt-3">
              <span className="material-symbols-outlined text-[14px] shrink-0">lightbulb</span>
              <span>{primaryRec.impact}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Recommendations - INFORMATIONAL DISPLAY */}
      {aiInsights.recommendations.length > 1 && (
        <div className="space-y-2">
          <p className="text-[10px] text-on-surface-variant uppercase tracking-wider font-semibold mb-2">
            More Insights
          </p>
          {aiInsights.recommendations.slice(1, 3).map((rec, idx) => {
            const colors = getPriorityColor(rec.priority)
            return (
              <div
                key={idx}
                className="flex items-start gap-2 p-2.5 rounded-lg bg-surface-container-low border border-border-low/50"
              >
                <span className={`material-symbols-outlined text-[16px] ${colors.color} shrink-0 mt-0.5`}>
                  {rec.priority === 'high' ? 'priority_high' : rec.priority === 'medium' ? 'adjust' : 'check_circle'}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-on-surface font-medium mb-0.5">{rec.title}</p>
                  <p className="text-[10px] text-on-surface-variant line-clamp-2">{rec.description}</p>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Health Score Indicator */}
      {aiInsights.healthScore && (
        <div className="mt-3 pt-3 border-t border-border-low">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-on-surface-variant uppercase tracking-wider">
              Workspace Health
            </span>
            <div className="flex items-center gap-1.5">
              <span className={`text-xs font-heading font-bold ${
                aiInsights.healthScore.status === 'healthy' ? 'text-emerald-500' :
                aiInsights.healthScore.status === 'warning' ? 'text-amber-500' : 'text-error'
              }`}>
                {aiInsights.healthScore.score}%
              </span>
              <span className={`w-2 h-2 rounded-full ${
                aiInsights.healthScore.status === 'healthy' ? 'bg-emerald-500' :
                aiInsights.healthScore.status === 'warning' ? 'bg-amber-500' : 'bg-error'
              }`} />
            </div>
          </div>
        </div>
      )}
    </Card>
  )
}
