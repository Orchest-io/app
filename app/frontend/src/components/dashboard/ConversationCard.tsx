import { useState, useRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import type { ConversationMessage } from '../../pages/Dashboard/dashboard.types'

interface ConversationCardProps {
  messages: ConversationMessage[]
  onSend: (content: string) => void
  isThinking: boolean
}

export default function ConversationCard({
  messages,
  onSend,
  isThinking,
}: ConversationCardProps) {
  const { t } = useTranslation()
  const [input, setInput] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)

  // Scroll to newest message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isThinking])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = input.trim()
    if (!trimmed) return
    onSend(trimmed)
    setInput('')
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e as unknown as React.FormEvent)
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Message thread */}
      <div className="flex-1 overflow-y-auto flex flex-col gap-3 mb-3 max-h-[240px] pr-1">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.role === 'assistant' && (
              <div className="w-6 h-6 rounded-full bg-electric-blue/15 border border-electric-blue/25 flex items-center justify-center shrink-0 mt-0.5">
                <span
                  className="material-symbols-outlined text-electric-blue text-[12px]"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  auto_awesome
                </span>
              </div>
            )}

            <div
              className={`max-w-[78%] px-3 py-2 rounded-xl text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-electric-blue text-white rounded-tr-sm'
                  : 'bg-surface-container-high border border-border-low text-on-surface rounded-tl-sm'
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}

        {isThinking && (
          <div className="flex gap-2 justify-start">
            <div className="w-6 h-6 rounded-full bg-electric-blue/15 border border-electric-blue/25 flex items-center justify-center shrink-0">
              <span
                className="material-symbols-outlined text-electric-blue text-[12px] animate-pulse"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                auto_awesome
              </span>
            </div>
            <div className="px-3 py-2 rounded-xl rounded-tl-sm bg-surface-container-high border border-border-low">
              <div className="flex gap-1 items-center h-4">
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    className="w-1.5 h-1.5 rounded-full bg-electric-blue/60 animate-bounce"
                    style={{ animationDelay: `${i * 150}ms` }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="flex gap-2 items-end">
        <textarea
          rows={1}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={t('dashboard.askAI')}
          aria-label="Chat with AI"
          className="flex-1 resize-none bg-surface-container border border-border-low rounded-lg px-3 py-2 text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:border-electric-blue/50 focus:shadow-[0_0_0_2px_rgba(0,123,255,0.12)] transition-all leading-relaxed max-h-[80px] overflow-y-auto"
          style={{ fieldSizing: 'content' } as React.CSSProperties}
        />
        <button
          type="submit"
          disabled={!input.trim() || isThinking}
          aria-label="Send message"
          className="w-9 h-9 rounded-lg bg-electric-blue text-white flex items-center justify-center shrink-0 hover:shadow-[0_0_16px_rgba(0,123,255,0.35)] active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
        >
          <span className="material-symbols-outlined text-[18px]">send</span>
        </button>
      </form>
    </div>
  )
}
