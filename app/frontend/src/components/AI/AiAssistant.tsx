import { useState, useRef, useEffect, type KeyboardEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { useAiAssistant, type ChatMessage } from '../../hooks/useAiAssistant'

export default function AiAssistant() {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  
  const welcomeMessage: ChatMessage = {
    role: 'assistant',
    content: t('aiAssistant.welcome'),
  }

  const [messages, setMessages] = useState<ChatMessage[]>([])
  
  // Set welcome message once translation hook is ready or when messages list is cleared/empty
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([welcomeMessage])
    }
  }, [messages.length, welcomeMessage.content])

  const [input, setInput] = useState('')
  const [conversationId, setConversationId] = useState<string | undefined>()
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const mutation = useAiAssistant()

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, mutation.isPending])

  // Focus input when panel opens
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 150)
    }
  }, [open])

  const handleSend = async () => {
    const trimmed = input.trim()
    if (!trimmed || mutation.isPending) return

    // Optimistically add user message
    const userMsg: ChatMessage = { role: 'user', content: trimmed }
    setMessages((prev) => [...prev, userMsg])
    setInput('')

    mutation.mutate(
      { message: trimmed, conversationId },
      {
        onSuccess: (data) => {
          setConversationId(data.conversationId)
          setMessages((prev) => [
            ...prev,
            { role: 'assistant', content: data.answer },
          ])
        },
        onError: () => {
          setMessages((prev) => [
            ...prev,
            {
              role: 'assistant',
              content: t('aiAssistant.errorMsg'),
            },
          ])
        },
      },
    )
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    // Send on Enter, newline on Shift+Enter
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleReset = () => {
    setMessages([welcomeMessage])
    setConversationId(undefined)
    setInput('')
  }

  return (
    <>
      {/* ── Floating trigger button ─────────────────────────────────── */}
      <button
        aria-label={t('aiAssistant.ariaLabel')}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-gradient-to-br from-electric-blue to-peri-purple shadow-[0_8px_32px_rgba(0,123,255,0.4)] flex items-center justify-center text-white transition-all duration-200 hover:scale-110 active:scale-95 cursor-pointer"
        onClick={() => setOpen((v) => !v)}
      >
        <span
          className="material-symbols-outlined text-[26px]"
          style={{ fontVariationSettings: "'FILL' 1" }}
        >
          {open ? 'close' : 'auto_awesome'}
        </span>
      </button>

      {/* ── Chat panel ─────────────────────────────────────────────── */}
      {open && (
        <div className="fixed bottom-24 right-6 z-50 w-[380px] max-w-[calc(100vw-24px)] flex flex-col rounded-2xl border border-border-low bg-surface-container-low shadow-[0_24px_80px_rgba(0,0,0,0.6)] overflow-hidden"
          style={{ height: '520px' }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-border-low bg-surface-container shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-electric-blue to-peri-purple flex items-center justify-center">
                <span
                  className="material-symbols-outlined text-white text-[16px]"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  auto_awesome
                </span>
              </div>
              <div>
                <p className="font-heading text-sm font-semibold text-on-surface leading-none">
                  {t('aiAssistant.title')}
                </p>
                <p className="text-[10px] text-emerald-400 mt-0.5 font-medium">
                  {t('aiAssistant.statusOnline')}
                </p>
              </div>
            </div>
            <button
              className="text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer p-1"
              title={t('aiAssistant.clearTitle') || 'Clear conversation'}
              onClick={handleReset}
            >
              <span className="material-symbols-outlined text-[18px]">
                restart_alt
              </span>
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3">
            {messages.map((msg, i) => (
              <MessageBubble key={i} message={msg} />
            ))}

            {/* Loading indicator */}
            {mutation.isPending && (
              <div className="flex items-start gap-2">
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-electric-blue/20 to-peri-purple/20 border border-border-low flex items-center justify-center shrink-0">
                  <span
                    className="material-symbols-outlined text-peri-purple text-[14px]"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    auto_awesome
                  </span>
                </div>
                <div className="px-4 py-3 rounded-2xl rounded-tl-none bg-surface-container border border-border-low">
                  <div className="flex gap-1 items-center h-4">
                    <span className="w-1.5 h-1.5 rounded-full bg-on-surface-variant animate-bounce [animation-delay:0ms]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-on-surface-variant animate-bounce [animation-delay:150ms]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-on-surface-variant animate-bounce [animation-delay:300ms]" />
                  </div>
                </div>
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="px-4 pb-4 pt-3 border-t border-border-low shrink-0">
            <div className="flex items-end gap-2 bg-surface-container border border-border-low rounded-xl px-3 py-2 focus-within:border-electric-blue/50 transition-colors">
              <textarea
                ref={inputRef}
                rows={1}
                value={input}
                placeholder={t('aiAssistant.placeholder') || 'Ask anything about the system...'}
                disabled={mutation.isPending}
                className="flex-1 bg-transparent text-sm text-on-surface placeholder:text-on-surface-variant/50 resize-none outline-none leading-relaxed max-h-[100px] disabled:opacity-50"
                style={{ minHeight: '24px' }}
                onChange={(e) => {
                  setInput(e.target.value)
                  // Auto-resize
                  e.target.style.height = 'auto'
                  e.target.style.height = `${Math.min(e.target.scrollHeight, 100)}px`
                }}
                onKeyDown={handleKeyDown}
              />
              <button
                disabled={!input.trim() || mutation.isPending}
                className="w-8 h-8 rounded-lg bg-electric-blue flex items-center justify-center text-white transition-all hover:bg-primary active:scale-90 disabled:opacity-40 disabled:cursor-not-allowed shrink-0 cursor-pointer"
                onClick={handleSend}
              >
                <span className="material-symbols-outlined text-[18px]">
                  send
                </span>
              </button>
            </div>
            <p className="text-[10px] text-on-surface-variant/50 text-center mt-2">
              {t('aiAssistant.hintText')}
            </p>
          </div>
        </div>
      )}
    </>
  )
}

// ─── Single message bubble ──────────────────────────────────────────
function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === 'user'

  if (isUser) {
    return (
      <div className="flex justify-end">
        <div className="max-w-[80%] px-4 py-2.5 rounded-2xl rounded-tr-none bg-electric-blue text-white text-sm leading-relaxed whitespace-pre-wrap break-words">
          {message.content}
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-start gap-2">
      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-electric-blue/20 to-peri-purple/20 border border-border-low flex items-center justify-center shrink-0 mt-0.5">
        <span
          className="material-symbols-outlined text-peri-purple text-[14px]"
          style={{ fontVariationSettings: "'FILL' 1" }}
        >
          auto_awesome
        </span>
      </div>
      <div className="max-w-[82%] px-4 py-2.5 rounded-2xl rounded-tl-none bg-surface-container border border-border-low text-sm text-on-surface leading-relaxed whitespace-pre-wrap break-words">
        {message.content}
      </div>
    </div>
  )
}
