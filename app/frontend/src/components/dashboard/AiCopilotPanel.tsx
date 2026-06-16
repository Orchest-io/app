<<<<<<< HEAD
import { useTranslation } from 'react-i18next'
=======
>>>>>>> c4de3810ef7844afb12cec71b8f19dc97aa60bd7
import SmartSuggestionCard from './SmartSuggestionCard'
import FocusInsightCard from './FocusInsightCard'
import type { ProjectListItemDto } from '../../pages/Dashboard/dashboard.types'

interface AiCopilotPanelProps {
  projects: ProjectListItemDto[]
}

export default function AiCopilotPanel({ projects }: AiCopilotPanelProps) {
<<<<<<< HEAD
  const { t } = useTranslation()

=======
>>>>>>> c4de3810ef7844afb12cec71b8f19dc97aa60bd7
  return (
    <div className="flex flex-col h-full bg-surface-container-lowest border border-border-low rounded-xl overflow-hidden">
      {/* Panel header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-border-low shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-electric-blue/15 border border-electric-blue/25 flex items-center justify-center">
            <span
              className="material-symbols-outlined text-electric-blue text-[18px]"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              auto_awesome
            </span>
          </div>
<<<<<<< HEAD
          <h3 className="font-heading text-sm font-bold text-on-surface">{t('dashboard.aiCopilot')}</h3>
        </div>
        <span className="px-2.5 py-0.5 rounded-full bg-surface-container-high text-on-surface-variant text-[10px] font-heading font-bold uppercase tracking-wider border border-border-low">
          {t('dashboard.comingSoon')}
=======
          <h3 className="font-heading text-sm font-bold text-on-surface">AI Copilot</h3>
        </div>
        <span className="px-2.5 py-0.5 rounded-full bg-surface-container-high text-on-surface-variant text-[10px] font-heading font-bold uppercase tracking-wider border border-border-low">
          Coming Soon
>>>>>>> c4de3810ef7844afb12cec71b8f19dc97aa60bd7
        </span>
      </div>

      {/* Panel body */}
      <div className="flex-1 overflow-y-auto flex flex-col gap-4 p-4">
        <SmartSuggestionCard projects={projects} />
        <FocusInsightCard />

        {/* ── CHAT SLOT ─────────────────────────────────────────────────────────
            TODO: Wire in the ConversationCard here once the AI chat module
            is implemented by the team.

            Example usage:
              import ConversationCard from './ConversationCard'
              <ConversationCard messages={messages} onSend={handleSend} isThinking={isThinking} />

            The ConversationCard component already exists at:
              src/components/dashboard/ConversationCard.tsx

            It expects:
              - messages: ConversationMessage[]
              - onSend: (content: string) => void
              - isThinking: boolean
        ───────────────────────────────────────────────────────────────────── */}
        <div className="flex-1 flex flex-col rounded-xl border border-dashed border-border-low bg-surface-glass min-h-[200px]">
          <div className="flex-1 flex flex-col items-center justify-center gap-3 p-6 text-center">
            <div className="w-10 h-10 rounded-full bg-surface-container-high border border-border-low flex items-center justify-center">
              <span
                className="material-symbols-outlined text-on-surface-variant text-[20px]"
                style={{ fontVariationSettings: "'FILL' 0" }}
              >
                chat_bubble
              </span>
            </div>
            <div>
              <p className="text-sm font-heading font-semibold text-on-surface-variant">
<<<<<<< HEAD
                {t('dashboard.aiChat')}
              </p>
              <p className="text-xs text-on-surface-variant/60 mt-1 leading-relaxed max-w-[180px]">
                {t('dashboard.aiChatDesc')}
=======
                AI Chat
              </p>
              <p className="text-xs text-on-surface-variant/60 mt-1 leading-relaxed max-w-[180px]">
                Live conversation will appear here once the chat module is connected.
>>>>>>> c4de3810ef7844afb12cec71b8f19dc97aa60bd7
              </p>
            </div>
          </div>

          {/* Placeholder input bar — visual only */}
          <div className="shrink-0 flex gap-2 items-center p-3 border-t border-border-low">
            <div className="flex-1 h-9 rounded-lg bg-surface-container border border-border-low flex items-center px-3">
<<<<<<< HEAD
              <span className="text-xs text-on-surface-variant/40">{t('dashboard.askAI')}</span>
=======
              <span className="text-xs text-on-surface-variant/40">Ask AI anything...</span>
>>>>>>> c4de3810ef7844afb12cec71b8f19dc97aa60bd7
            </div>
            <div className="w-9 h-9 rounded-lg bg-surface-container border border-border-low flex items-center justify-center shrink-0 opacity-40">
              <span className="material-symbols-outlined text-on-surface-variant text-[18px]">send</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
