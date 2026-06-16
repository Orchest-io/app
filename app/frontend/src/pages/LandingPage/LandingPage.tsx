import { useNavigate } from 'react-router-dom'
import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button, Card } from '../../components/ui'
import { toast } from 'sonner'

// ─── useInView hook for scroll reveal ──────────────────────────────
function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.disconnect() } },
      { threshold },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [threshold])

  return { ref, visible }
}

// ─── Reveal wrapper ─────────────────────────────────────────────────
function Reveal({
  children,
  delay = 0,
  direction = 'up',
  className = '',
}: {
  children: React.ReactNode
  delay?: number
  direction?: 'up' | 'left' | 'right' | 'none'
  className?: string
}) {
  const { ref, visible } = useInView()

  const base = 'transition-all duration-700 ease-out'
  const hidden: Record<string, string> = {
    up: 'opacity-0 translate-y-10',
    left: 'opacity-0 -translate-x-10',
    right: 'opacity-0 translate-x-10',
    none: 'opacity-0',
  }
  const show = 'opacity-100 translate-y-0 translate-x-0'

  return (
    <div
      ref={ref}
      className={`${base} ${visible ? show : hidden[direction]} ${className}`}
      style={{ transitionDelay: visible ? `${delay}ms` : '0ms' }}
    >
      {children}
    </div>
  )
}

// ─── Animated counter ───────────────────────────────────────────────
function Counter({ to, suffix = '', duration = 1800 }: { to: number; suffix?: string; duration?: number }) {
  const [count, setCount] = useState(0)
  const { ref, visible } = useInView(0.3)
  const started = useRef(false)

  useEffect(() => {
    if (!visible || started.current) return
    started.current = true
    const start = performance.now()
    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setCount(Math.round(eased * to))
      if (progress < 1) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }, [visible, to, duration])

  return <span ref={ref}>{count}{suffix}</span>
}

// ─── Typing effect ───────────────────────────────────────────────────
function TypingWord() {
  const { t } = useTranslation()
  const WORDS = [t('landing.typingWord1'), t('landing.typingWord2'), t('landing.typingWord3'), t('landing.typingWord4')]

  const [wordIdx, setWordIdx] = useState(0)
  const [displayed, setDisplayed] = useState('')
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    const word = WORDS[wordIdx]
    let timeout: ReturnType<typeof setTimeout>

    if (!deleting && displayed.length < word.length) {
      timeout = setTimeout(() => setDisplayed(word.slice(0, displayed.length + 1)), 60)
    } else if (!deleting && displayed.length === word.length) {
      timeout = setTimeout(() => setDeleting(true), 2200)
    } else if (deleting && displayed.length > 0) {
      timeout = setTimeout(() => setDisplayed(displayed.slice(0, -1)), 35)
    } else if (deleting && displayed.length === 0) {
      setDeleting(false)
      setWordIdx((i) => (i + 1) % WORDS.length)
    }

    return () => clearTimeout(timeout)
  }, [displayed, deleting, wordIdx])

  return (
    <span className="text-transparent bg-clip-text bg-gradient-to-r from-electric-blue to-peri-purple">
      {displayed}
      <span className="animate-pulse text-electric-blue">|</span>
    </span>
  )
}

// ────────────────────────────────────────────────────────────────────
export default function LandingPage() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const isLoggedIn = !!localStorage.getItem('orchest_user_id')
  const startPath = isLoggedIn ? '/dashboard' : '/register'

  // smooth scroll for nav links
  const scrollTo = (id: string) => {
    const el = document.getElementById(id)
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  // active nav link based on scroll
  const [activeSection, setActiveSection] = useState('hero')
  useEffect(() => {
    const ids = ['hero', 'product', 'testimonials', 'pricing']
    const observers = ids.map((id) => {
      const el = document.getElementById(id)
      if (!el) return null
      const obs = new IntersectionObserver(
        ([e]) => { if (e.isIntersecting) setActiveSection(id) },
        { threshold: 0.4 },
      )
      obs.observe(el)
      return obs
    })
    return () => observers.forEach((o) => o?.disconnect())
  }, [])

  // Testimonials data
  const TESTIMONIALS = [
    {
      name: t('landing.testimonial1Name'),
      role: t('landing.testimonial1Role'),
      avatar: 'SC',
      color: 'from-blue-500 to-indigo-500',
      quote: t('landing.testimonial1Quote'),
    },
    {
      name: t('landing.testimonial2Name'),
      role: t('landing.testimonial2Role'),
      avatar: 'MO',
      color: 'from-purple-500 to-pink-500',
      quote: t('landing.testimonial2Quote'),
    },
    {
      name: t('landing.testimonial3Name'),
      role: t('landing.testimonial3Role'),
      avatar: 'LH',
      color: 'from-emerald-500 to-teal-500',
      quote: t('landing.testimonial3Quote'),
    },
  ]

  // Pricing data
  const PLANS = [
    {
      name: t('landing.starter'),
      price: 0,
      desc: t('landing.starterDesc'),
      color: 'border-border-low',
      badge: null,
      features: [t('landing.starterFeature1'), t('landing.starterFeature2'), t('landing.starterFeature3'), t('landing.starterFeature4')],
      cta: t('landing.startFreeBtn'),
      highlight: false,
    },
    {
      name: t('landing.pro'),
      price: 29,
      desc: t('landing.proDesc'),
      color: 'border-electric-blue/50',
      badge: t('landing.mostPopular'),
      features: [t('landing.proFeature1'), t('landing.proFeature2'), t('landing.proFeature3'), t('landing.proFeature4'), t('landing.proFeature5')],
      cta: t('landing.startProTrial'),
      highlight: true,
    },
    {
      name: t('landing.enterprise'),
      price: null,
      desc: t('landing.enterpriseDesc'),
      color: 'border-peri-purple/40',
      badge: null,
      features: [t('landing.enterpriseFeature1'), t('landing.enterpriseFeature2'), t('landing.enterpriseFeature3'), t('landing.enterpriseFeature4'), t('landing.enterpriseFeature5')],
      cta: t('landing.contactSales'),
      highlight: false,
    },
  ]

  // Product features
  const FEATURES = [
    { icon: 'neurology', color: 'electric-blue', bg: 'bg-electric-blue/10 group-hover:bg-electric-blue/20', title: t('landing.selfHealing'), desc: t('landing.selfHealingDesc') },
    { icon: 'smart_toy', color: 'peri-purple', bg: 'bg-peri-purple/10 group-hover:bg-peri-purple/20', title: t('landing.contextualBriefings'), desc: t('landing.contextualBriefingsDesc') },
    { icon: 'verified_user', color: 'on-surface', bg: 'bg-on-surface/10 group-hover:bg-on-surface/20', title: t('landing.riskPrediction'), desc: t('landing.riskPredictionDesc') },
  ]

  // Feature split
  const SPLIT_FEATURES = [
    { title: t('landing.dynamicResourceMapping'), desc: t('landing.dynamicResourceMappingDesc') },
    { title: t('landing.universalConnector'), desc: t('landing.universalConnectorDesc') },
    { title: t('landing.enterpriseSecurity'), desc: t('landing.enterpriseSecurityDesc') },
  ]

  return (
    <div className="bg-mesh min-h-screen text-on-surface font-body selection:bg-electric-blue/30 selection:text-white">

      {/* ── Fixed Nav ─────────────────────────────────────────────── */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex justify-between items-center px-6 md:px-10 h-20 backdrop-blur-md border-b border-border-low bg-bg-deep/75">
        <div className="flex items-center gap-2 cursor-pointer select-none" onClick={() => navigate('/')}>
          <img 
            src="/orkest-logo.png" 
            alt="Orkest" 
            className="h-16 w-auto"
          />
        </div>

        <div className="hidden md:flex items-center gap-8 font-heading text-xs uppercase tracking-widest font-semibold">
          {[
            { label: t('landing.product'), id: 'product' },
            { label: t('landing.testimonials'), id: 'testimonials' },
            { label: t('landing.pricing'), id: 'pricing' },
          ].map(({ label, id }) => (
            <button
              key={id}
              onClick={() => scrollTo(id)}
              className={`py-1 transition-all border-b-2 cursor-pointer ${
                activeSection === id
                  ? 'text-primary border-primary'
                  : 'text-on-surface-variant border-transparent hover:text-primary hover:border-primary/40'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <button
            className="px-4 py-2 rounded-full font-heading text-xs uppercase tracking-wider font-semibold text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer"
            onClick={() => navigate(isLoggedIn ? '/dashboard' : '/login')}
          >
            {isLoggedIn ? t('landing.dashboard') : t('landing.login')}
          </button>
          <Button
            size="sm"
            className="rounded-full px-5 py-2 uppercase text-xs tracking-wider font-semibold"
            onClick={() => navigate(startPath)}
          >
            {isLoggedIn ? t('landing.goToDashboard') : t('landing.getStarted')}
          </Button>
        </div>
      </nav>

      <main className="relative pt-32 pb-12">

        {/* ── Hero ──────────────────────────────────────────────────── */}
        <section id="hero" className="max-w-7xl mx-auto px-6 md:px-8 text-center mb-24 relative">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-96 bg-electric-blue/5 blur-[120px] rounded-full pointer-events-none -z-10" />

          {/* Badge */}
          <Reveal>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-card border border-peri-purple/20 mb-8 hover:border-peri-purple/35 transition-colors duration-300">
              <span className="material-symbols-outlined text-peri-purple text-sm animate-pulse" style={{ fontVariationSettings: "'FILL' 1" }}>
                auto_awesome
              </span>
              <span className="font-heading text-[10px] text-peri-purple uppercase tracking-widest font-semibold">
                {t('landing.newBadge')}
              </span>
            </div>
          </Reveal>

          {/* Heading with typing effect */}
          <Reveal delay={100}>
            <h1 className="font-heading text-4xl md:text-6xl font-extrabold text-on-surface mb-6 leading-tight max-w-4xl mx-auto tracking-tight min-h-[4rem] md:min-h-[7rem]">
              {t('landing.heroTitle')}{' '}
              <br className="hidden md:block" />
              <TypingWord />
            </h1>
          </Reveal>

          <Reveal delay={200}>
            <p className="font-body text-sm md:text-base text-on-surface-variant max-w-2xl mx-auto mb-10 leading-relaxed">
              {t('landing.heroDesc')}
            </p>
          </Reveal>

          {/* CTAs */}
          <Reveal delay={300}>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8 relative z-10">
              <button
                className="px-8 py-3.5 bg-gradient-to-r from-electric-blue to-blue-600 rounded-full font-heading text-sm text-white font-bold electric-glow transition-transform hover:scale-105 active:scale-95 cursor-pointer"
                onClick={() => navigate(startPath)}
              >
                {isLoggedIn ? t('landing.goToDashboard') : t('landing.startFree')}
              </button>
              <button
                className="px-8 py-3.5 glass-card rounded-full font-heading text-sm text-on-surface font-bold hover:bg-surface-glass transition-all active:scale-95 cursor-pointer flex items-center gap-2"
                onClick={() => toast.success(t('landing.demoRequested'))}
              >
                <span className="material-symbols-outlined text-[18px]">play_circle</span>
                {t('landing.watchDemo')}
              </button>
            </div>
          </Reveal>

          {/* Social proof micro-line */}
          <Reveal delay={400}>
            <p className="text-[11px] text-on-surface-variant mb-16 tracking-wide">
              {t('landing.trustedBy')} <span className="text-on-surface font-semibold">2,400+</span> {t('landing.teamsWorldwide')}
            </p>
          </Reveal>

          {/* Dashboard Preview */}
          <Reveal delay={200} direction="none">
            <div className="relative max-w-5xl mx-auto">
              <div className="glass-card rounded-[24px] sm:rounded-[32px] overflow-hidden border border-white/10 shadow-2xl relative z-10 bg-surface-container-lowest">
                <img
                  alt="Dashboard Preview"
                  className="w-full h-auto object-cover opacity-90"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuB-a2o9Vn7AwZcuTBwC-7TZxzZjAqzo2FPVhaEsfmdH5HDby1MZgKZ9UARU2niDYKLBq2JbCqyxA_wL2OD4xhCipIvIIJdZslqyppbnbiCvBjcrxFN2X2YsxI-6woc1RKNY2oadG7OIcp5zxhf3SBHt08IPGg9U81306pLEYilrLAgyby2_O5B294tnrULq7OaSo79aqDtydIwGB7pUDRBHsxgYAXm3dsZa7jngFbHQOoaCHickyzbZ2T3mU7Z7cC9cP91g8uE0w5s"
                />

                {/* Floating Insight Card */}
                <div className="absolute top-8 right-8 w-64 glass-card p-5 rounded-2xl border border-white/20 peri-glow hidden lg:block text-left z-20 animate-[float_4s_ease-in-out_infinite]">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="material-symbols-outlined text-peri-purple text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>insights</span>
                    <span className="font-heading text-[10px] text-on-surface uppercase tracking-wider font-semibold">{t('landing.aiInsight')}</span>
                  </div>
                  <p className="font-body text-xs text-on-surface-variant leading-relaxed">
                    {t('landing.aiInsightText')}
                  </p>
                  <div className="mt-4 pt-3 border-t border-white/5 flex gap-2">
                    <button className="px-3 py-1 bg-peri-purple/20 text-peri-purple rounded-md font-heading text-[10px] font-semibold hover:bg-peri-purple/35 transition-colors cursor-pointer" onClick={() => toast.success(t('landing.insightAccepted'))}>{t('landing.accept')}</button>
                    <button className="px-3 py-1 glass-card text-on-surface-variant rounded-md font-heading text-[10px] hover:text-on-surface transition-colors cursor-pointer" onClick={() => toast.info(t('landing.insightDismissed'))}>{t('landing.ignore')}</button>
                  </div>
                </div>

                {/* Floating Sprint Card */}
                <div className="absolute -bottom-6 -left-6 w-72 glass-card p-5 rounded-2xl border border-white/20 electric-glow hidden lg:block text-left z-20 animate-[float_4s_ease-in-out_1s_infinite]">
                  <div className="flex justify-between items-center mb-3">
                    <span className="font-heading text-xs font-bold text-electric-blue uppercase tracking-wider">{t('landing.activeSprint')}</span>
                    <span className="material-symbols-outlined text-on-surface-variant text-md">more_horiz</span>
                  </div>
                  <div className="space-y-4">
                    <div className="h-2 bg-surface-container-highest rounded-full overflow-hidden">
                      <div className="w-[75%] h-full bg-electric-blue rounded-full shadow-[0_0_10px_rgba(0,123,255,0.8)]" />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex -space-x-2.5">
                        {['SC', 'MO', '+4'].map((a, i) => (
                          <div key={i} className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 border-2 border-bg-deep flex items-center justify-center text-white font-heading text-[9px] font-bold">
                            {a}
                          </div>
                        ))}
                      </div>
                      <span className="font-heading text-[10px] text-on-surface-variant uppercase tracking-wider font-semibold">{t('landing.sprintComplete')}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Scroll indicator */}
              <div className="flex flex-col items-center gap-2 mt-12 text-on-surface-variant animate-bounce">
                <span className="text-[11px] font-heading uppercase tracking-widest">{t('landing.scrollToExplore')}</span>
                <span className="material-symbols-outlined text-[20px]">expand_more</span>
              </div>
            </div>
          </Reveal>
        </section>

        {/* ── Product / Autonomous Workflows ────────────────────── */}
        <section id="product" className="max-w-7xl mx-auto px-6 md:px-8 mb-24 scroll-mt-24">
          <Reveal>
            <div className="text-center mb-16">
              <h2 className="font-heading text-3xl font-bold text-on-surface tracking-tight mb-4">
                {t('landing.autonomousWorkflows')}
              </h2>
              <p className="font-body text-sm text-on-surface-variant max-w-md mx-auto">
                {t('landing.autonomousDesc')}
              </p>
            </div>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {FEATURES.map(({ icon, color, bg, title, desc }, i) => (
              <Reveal key={title} delay={i * 120} direction="up">
                <Card hoverable className={`p-8 group border border-border-low transition-all duration-300 hover:-translate-y-2 hover:border-${color}/30 h-full`}>
                  <div className={`w-12 h-12 rounded-xl ${bg} flex items-center justify-center mb-6 text-${color} transition-colors`}>
                    <span className="material-symbols-outlined text-[24px]">{icon}</span>
                  </div>
                  <h3 className="font-heading text-lg font-bold text-on-surface mb-3">{title}</h3>
                  <p className="font-body text-xs text-on-surface-variant leading-relaxed">{desc}</p>
                </Card>
              </Reveal>
            ))}
          </div>
        </section>

        {/* ── Feature Split ─────────────────────────────────────────── */}
        <section className="max-w-7xl mx-auto px-6 md:px-8 mb-24">
          <div className="glass-card rounded-[32px] md:rounded-[40px] p-8 md:p-14 overflow-hidden relative border border-border-low">
            <div className="absolute top-0 right-0 w-1/2 h-full bg-electric-blue/10 blur-[100px] -z-10 pointer-events-none" />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <Reveal direction="left">
                <div>
                  <h2 className="font-heading text-2xl md:text-4xl font-extrabold text-on-surface mb-8 leading-tight tracking-tight">
                    {t('landing.masterComplexity')} <br />
                    <span className="text-peri-purple">{t('landing.predictiveIntelligence')}</span>
                  </h2>

                  <ul className="space-y-6">
                    {SPLIT_FEATURES.map(({ title, desc }) => (
                      <li key={title} className="flex items-start gap-4 group">
                        <span className="material-symbols-outlined text-electric-blue mt-0.5 text-xl transition-transform group-hover:scale-110">check_circle</span>
                        <div>
                          <h4 className="font-heading text-sm font-bold text-on-surface">{title}</h4>
                          <p className="font-body text-xs text-on-surface-variant mt-1 leading-relaxed">{desc}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>

              <Reveal direction="right">
                <div className="relative">
                  <div className="aspect-square rounded-[24px] md:rounded-[32px] overflow-hidden glass-card border border-white/5 shadow-2xl relative">
                    <img
                      alt="AI Network"
                      className="w-full h-full object-cover opacity-80"
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuAQ2l8B5rH8sYWp1lBYgI4m2AO4oluplbhLJ8kvc57VUF9xhonvqiqhsdjWvkIu7FBba-HfwlJtib8K61DsBUwMPIpYXjwU2Ug9nG6bxpOlS4NB4MsX90ajd8VSsuEPHMakef-LbMLRgWFQwVlUUzAulS6_tCVPglkUzi76t8ZXbgLlAtWHBK8Hzw5xpy8pF12WusVFwYWQkE3yfJU0CPFNzi-bh-hodTbNDnxLuSp2pBQ4Yw9n7i557TYLSHezXEyoaZAur6y_MjM"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/10">
                      <div className="p-8 rounded-full bg-surface-container-lowest/80 border border-peri-purple/30 shadow-2xl animate-pulse">
                        <span className="material-symbols-outlined text-peri-purple text-5xl" style={{ fontVariationSettings: "'FILL' 1" }}>hub</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Reveal>
            </div>
          </div>
        </section>

        {/* ── Stats with animated counters ──────────────────────────── */}
        <section className="max-w-7xl mx-auto px-6 md:px-8 mb-24">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Reveal direction="up" delay={0} className="md:col-span-2">
              <Card className="p-10 flex flex-col justify-between border border-border-low h-full">
                <h3 className="font-heading text-2xl md:text-3xl font-bold leading-tight text-on-surface mb-6">
                  {t('landing.globalScale')} <br />{t('landing.performance')}
                </h3>
                <div className="flex items-end justify-between mt-auto">
                  <span className="font-heading text-5xl font-extrabold text-electric-blue leading-none">
                    <Counter to={99} suffix=".9%" duration={1600} />
                  </span>
                  <span className="font-heading text-[10px] uppercase tracking-widest text-on-surface-variant font-bold pb-1">{t('landing.uptimeSLA')}</span>
                </div>
              </Card>
            </Reveal>

            <Reveal direction="up" delay={120}>
              <Card className="p-10 flex flex-col justify-between border border-border-low h-full">
                <span className="material-symbols-outlined text-peri-purple text-4xl mb-6 self-start">language</span>
                <div className="mt-auto">
                  <h4 className="font-heading text-2xl font-bold text-on-surface mb-1">24/7</h4>
                  <p className="font-heading text-[10px] text-on-surface-variant uppercase tracking-wider font-bold">{t('landing.globalSupport')}</p>
                </div>
              </Card>
            </Reveal>

            <Reveal direction="up" delay={240}>
              <Card className="p-10 flex flex-col justify-between border border-border-low h-full">
                <span className="material-symbols-outlined text-electric-blue text-4xl mb-6 self-start">bolt</span>
                <div className="mt-auto">
                  <h4 className="font-heading text-2xl font-bold text-on-surface mb-1">
                    &lt;<Counter to={50} suffix="ms" duration={1200} />
                  </h4>
                  <p className="font-heading text-[10px] text-on-surface-variant uppercase tracking-wider font-bold">{t('landing.actionLatency')}</p>
                </div>
              </Card>
            </Reveal>
          </div>

          {/* Extra stat row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
            {[
              { icon: 'group', color: 'text-electric-blue', value: <><Counter to={2400} suffix="+" duration={2000} /></>, label: t('landing.teamsLabel') },
              { icon: 'task_alt', color: 'text-peri-purple', value: <><Counter to={18} suffix="M+" duration={1800} /></>, label: t('landing.tasksOrchestrated') },
              { icon: 'speed', color: 'text-emerald-400', value: <><Counter to={60} suffix="%" duration={1500} /></>, label: t('landing.avgTimeSaved') },
            ].map(({ icon, color, value, label }, i) => (
              <Reveal key={label} direction="up" delay={i * 100}>
                <Card className="p-8 flex items-center gap-6 border border-border-low">
                  <span className={`material-symbols-outlined text-4xl ${color}`}>{icon}</span>
                  <div>
                    <p className="font-heading text-3xl font-extrabold text-on-surface">{value}</p>
                    <p className="font-heading text-[10px] text-on-surface-variant uppercase tracking-wider font-bold mt-1">{label}</p>
                  </div>
                </Card>
              </Reveal>
            ))}
          </div>
        </section>

        {/* ── Testimonials ──────────────────────────────────────────── */}
        <section id="testimonials" className="max-w-7xl mx-auto px-6 md:px-8 mb-24 scroll-mt-24">
          <Reveal>
            <div className="text-center mb-16">
              <h2 className="font-heading text-3xl font-bold text-on-surface tracking-tight mb-4">
                {t('landing.lovedByLeaders')}
              </h2>
              <p className="font-body text-sm text-on-surface-variant max-w-md mx-auto">
                {t('landing.lovedByDesc')}
              </p>
            </div>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map(({ name, role, avatar, color, quote }, i) => (
              <Reveal key={name} delay={i * 120} direction="up">
                <Card className="p-8 flex flex-col gap-5 border border-border-low hover:border-white/15 transition-colors h-full">
                  {/* Stars */}
                  <div className="flex gap-1">
                    {Array.from({ length: 5 }).map((_, s) => (
                      <span key={s} className="material-symbols-outlined text-amber-400 text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                    ))}
                  </div>

                  <p className="font-body text-sm text-on-surface-variant leading-relaxed flex-1">
                    "{quote}"
                  </p>

                  <div className="flex items-center gap-3 pt-4 border-t border-border-low">
                    <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${color} flex items-center justify-center text-white font-heading font-bold text-xs shrink-0`}>
                      {avatar}
                    </div>
                    <div>
                      <p className="font-heading text-sm font-semibold text-on-surface">{name}</p>
                      <p className="font-body text-[11px] text-on-surface-variant">{role}</p>
                    </div>
                  </div>
                </Card>
              </Reveal>
            ))}
          </div>
        </section>

        {/* ── Pricing ───────────────────────────────────────────────── */}
        <section id="pricing" className="max-w-7xl mx-auto px-6 md:px-8 mb-24 scroll-mt-24">
          <Reveal>
            <div className="text-center mb-16">
              <h2 className="font-heading text-3xl font-bold text-on-surface tracking-tight mb-4">
                {t('landing.simplePricing')}
              </h2>
              <p className="font-body text-sm text-on-surface-variant max-w-md mx-auto">
                {t('landing.pricingDesc')}
              </p>
            </div>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
            {PLANS.map(({ name, price, desc, color, badge, features, cta, highlight }, i) => (
              <Reveal key={name} delay={i * 120} direction="up">
                <div className={`relative flex flex-col rounded-2xl border p-8 h-full transition-all duration-300 hover:-translate-y-1 ${color} ${highlight ? 'bg-electric-blue/5 shadow-[0_0_40px_rgba(0,123,255,0.12)]' : 'glass-card'}`}>
                  {badge && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-electric-blue text-white font-heading text-[10px] uppercase tracking-widest font-bold shadow-lg">
                      {badge}
                    </span>
                  )}

                  <div className="mb-6">
                    <h3 className="font-heading text-xl font-bold text-on-surface mb-2">{name}</h3>
                    <p className="font-body text-xs text-on-surface-variant">{desc}</p>
                  </div>

                  <div className="mb-8">
                    {price !== null ? (
                      <div className="flex items-end gap-1">
                        <span className="font-heading text-5xl font-extrabold text-on-surface">${price}</span>
                        <span className="font-body text-sm text-on-surface-variant mb-1">{t('landing.perMonth')}</span>
                      </div>
                    ) : (
                      <span className="font-heading text-4xl font-extrabold text-on-surface">{t('landing.custom')}</span>
                    )}
                  </div>

                  <ul className="space-y-3 mb-8 flex-1">
                    {features.map((f) => (
                      <li key={f} className="flex items-center gap-3 text-xs text-on-surface-variant">
                        <span className="material-symbols-outlined text-electric-blue text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                        {f}
                      </li>
                    ))}
                  </ul>

                  <button
                    className={`w-full py-3 rounded-xl font-heading text-sm font-bold transition-all active:scale-95 cursor-pointer ${
                      highlight
                        ? 'bg-electric-blue text-white hover:bg-primary shadow-[0_4px_20px_rgba(0,123,255,0.3)]'
                        : 'glass-card border border-border-low text-on-surface hover:border-white/20'
                    }`}
                    onClick={() => name === t('landing.enterprise') ? toast.info(t('landing.contactSalesMsg')) : navigate(startPath)}
                  >
                    {cta}
                  </button>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* ── Final CTA ─────────────────────────────────────────────── */}
        <section className="max-w-4xl mx-auto px-6 md:px-8 mb-24 text-center">
          <Reveal direction="none">
            <div className="glass-card rounded-[32px] p-12 md:p-16 border border-electric-blue/20 relative overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(0,123,255,0.12),transparent_60%)] pointer-events-none" />
              <span className="material-symbols-outlined text-electric-blue text-5xl mb-6 block" style={{ fontVariationSettings: "'FILL' 1" }}>
                rocket_launch
              </span>
              <h2 className="font-heading text-3xl md:text-4xl font-extrabold text-on-surface mb-4 tracking-tight">
                {t('landing.readyToMove')}
              </h2>
              <p className="font-body text-sm text-on-surface-variant max-w-md mx-auto mb-8 leading-relaxed">
                {t('landing.readyDesc')}
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <button
                  className="px-10 py-4 bg-gradient-to-r from-electric-blue to-blue-600 rounded-full font-heading text-sm text-white font-bold electric-glow transition-transform hover:scale-105 active:scale-95 cursor-pointer"
                  onClick={() => navigate(startPath)}
                >
                  {isLoggedIn ? t('landing.goToDashboard') : t('landing.startFreeToday')}
                </button>
                <button
                  className="px-10 py-4 glass-card rounded-full font-heading text-sm text-on-surface font-bold border border-border-low hover:border-white/20 transition-all active:scale-95 cursor-pointer"
                  onClick={() => navigate('/login')}
                >
                  {isLoggedIn ? t('landing.viewProjects') : t('landing.signIn')}
                </button>
              </div>
              <p className="mt-6 text-[11px] text-on-surface-variant">{t('landing.noCreditCard')}</p>
            </div>
          </Reveal>
        </section>

      </main>

      {/* ── Footer ────────────────────────────────────────────────── */}
      <footer className="py-20 bg-surface-container-lowest border-t border-border-low">
        <div className="max-w-7xl mx-auto px-6 md:px-8">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-12 mb-20">
            <div className="md:col-span-2">
              <div className="flex items-center gap-2 mb-6">
                <img 
                  src="/orkest-logo.png" 
                  alt="Orkest" 
                  className="h-10 w-auto"
                />
              </div>
              <p className="font-body text-xs text-on-surface-variant max-w-xs leading-relaxed">
                {t('landing.footerDesc')}
              </p>
              {/* Newsletter */}
              <div className="mt-6 flex gap-2">
                <input
                  type="email"
                  placeholder="your@email.com"
                  className="flex-1 px-4 py-2 rounded-lg bg-surface-container-low border border-border-low text-xs text-on-surface placeholder:text-on-surface-variant/50 outline-none focus:border-electric-blue/50 transition-colors"
                />
                <button
                  className="px-4 py-2 bg-electric-blue text-white rounded-lg font-heading text-xs font-semibold hover:bg-primary transition-colors cursor-pointer"
                  onClick={() => toast.success(t('landing.subscribed'))}
                >
                  {t('landing.subscribe')}
                </button>
              </div>
            </div>

            <div>
              <h5 className="font-heading text-[10px] uppercase tracking-widest text-on-surface font-bold mb-6">{t('landing.company')}</h5>
              <ul className="space-y-4 font-body text-xs text-on-surface-variant">
                {[t('landing.about'), t('landing.careers'), t('landing.manifesto'), t('landing.contact')].map((l) => (
                  <li key={l}><a className="hover:text-electric-blue transition-colors cursor-pointer">{l}</a></li>
                ))}
              </ul>
            </div>

            <div>
              <h5 className="font-heading text-[10px] uppercase tracking-widest text-on-surface font-bold mb-6">{t('landing.resources')}</h5>
              <ul className="space-y-4 font-body text-xs text-on-surface-variant">
                {[t('landing.documentation'), t('landing.apiStatus'), t('landing.community'), t('landing.trustCenter')].map((l) => (
                  <li key={l}><a className="hover:text-electric-blue transition-colors cursor-pointer">{l}</a></li>
                ))}
              </ul>
            </div>

            <div>
              <h5 className="font-heading text-[10px] uppercase tracking-widest text-on-surface font-bold mb-6">{t('landing.social')}</h5>
              <ul className="space-y-4 font-body text-xs text-on-surface-variant">
                {['X / Twitter', 'LinkedIn', 'GitHub', 'Discord'].map((l) => (
                  <li key={l}><a className="hover:text-electric-blue transition-colors cursor-pointer">{l}</a></li>
                ))}
              </ul>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center justify-between pt-10 border-t border-border-low font-heading text-[10px] text-on-surface-variant tracking-wider uppercase font-semibold">
            <p>{t('landing.copyright')}</p>
            <div className="flex gap-8 mt-6 md:mt-0">
              {[t('landing.privacyPolicy'), t('landing.termsOfService'), t('landing.cookieSettings')].map((l) => (
                <a key={l} className="hover:text-on-surface transition-colors cursor-pointer">{l}</a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
