import { useNavigate } from 'react-router-dom'
import { Button, Card } from '../../components/ui'
import { toast } from 'sonner'

export default function LandingPage() {
  const navigate = useNavigate()

  return (
    <div className="bg-mesh min-h-screen text-on-surface font-body selection:bg-electric-blue/30 selection:text-white">
      {/* Fixed Top Navigation Bar */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex justify-between items-center px-6 md:px-10 h-20 backdrop-blur-md border-b border-border-low bg-bg-deep/75">
        <div className="flex items-center gap-2 cursor-pointer select-none" onClick={() => navigate('/')}>
          <span className="material-symbols-outlined text-electric-blue text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>
            tactic
          </span>
          <span className="font-heading text-lg md:text-xl font-bold text-on-surface tracking-tight">
            AI Smart Team Planner
          </span>
        </div>
        
        {/* Navigation Links */}
        <div className="hidden md:flex items-center gap-8 font-heading text-xs uppercase tracking-widest font-semibold">
          <a className="text-primary border-b-2 border-primary py-1 transition-all" href="#product" onClick={(e) => { e.preventDefault(); toast.info('Product features are listed below!') }}>
            Product
          </a>
          <a className="text-on-surface-variant hover:text-primary py-1 transition-all" href="#solutions" onClick={(e) => { e.preventDefault(); toast.info('Enterprise and custom solutions coming soon!') }}>
            Solutions
          </a>
          <a className="text-on-surface-variant hover:text-primary py-1 transition-all" href="#enterprise" onClick={(e) => { e.preventDefault(); toast.info('Contact sales for private cloud deployments.') }}>
            Enterprise
          </a>
          <a className="text-on-surface-variant hover:text-primary py-1 transition-all" href="#pricing" onClick={(e) => { e.preventDefault(); toast.info('Pricing starts free for up to 5 members!') }}>
            Pricing
          </a>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <button 
            className="px-4 py-2 rounded-full font-heading text-xs uppercase tracking-wider font-semibold text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer"
            onClick={() => navigate('/login')}
          >
            Login
          </button>
          <Button 
            size="sm" 
            className="rounded-full px-5 py-2 uppercase text-xs tracking-wider font-semibold"
            onClick={() => navigate('/dashboard')}
          >
            Launch App
          </Button>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="relative pt-32 pb-12">
        {/* Hero Section */}
        <section className="max-w-7xl mx-auto px-6 md:px-8 text-center mb-24 relative">
          {/* Subtle electric blue ambient glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-96 bg-electric-blue/5 blur-[120px] rounded-full pointer-events-none -z-10" />

          {/* Sparkle Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-card border border-peri-purple/20 mb-8 hover:border-peri-purple/35 transition-colors duration-300">
            <span className="material-symbols-outlined text-peri-purple text-sm animate-pulse" style={{ fontVariationSettings: "'FILL' 1" }}>
              auto_awesome
            </span>
            <span className="font-heading text-[10px] text-peri-purple uppercase tracking-widest font-semibold">
              New: GPT-4o Integration Live
            </span>
          </div>

          {/* Heading */}
          <h1 className="font-heading text-4xl md:text-6xl font-extrabold text-on-surface mb-6 leading-tight max-w-4xl mx-auto tracking-tight">
            The AI Operating System for{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-electric-blue to-peri-purple">
              Team Productivity
            </span>
          </h1>

          {/* Subtitle */}
          <p className="font-body text-sm md:text-base text-on-surface-variant max-w-2xl mx-auto mb-10 leading-relaxed">
            Synchronize your enterprise workflow with a silent, proactive AI partner. Eliminate manual task mapping and let neural logic drive your roadmap.
          </p>

          {/* Hero Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20 relative z-10">
            <button 
              className="px-8 py-3.5 bg-gradient-to-r from-electric-blue to-blue-600 rounded-full font-heading text-sm text-white font-bold electric-glow transition-transform hover:scale-105 active:scale-95 cursor-pointer"
              onClick={() => navigate('/login')}
            >
              Start Free
            </button>
            <button 
              className="px-8 py-3.5 glass-card rounded-full font-heading text-sm text-on-surface font-bold hover:bg-surface-glass transition-all active:scale-95 cursor-pointer"
              onClick={() => toast.success('Demo booking requested! Our team will contact you.')}
            >
              Book Demo
            </button>
          </div>

          {/* Dashboard Preview with Floating Cards */}
          <div className="relative max-w-5xl mx-auto">
            <div className="glass-card rounded-[24px] sm:rounded-[32px] overflow-hidden border border-white/10 shadow-2xl relative z-10 bg-surface-container-lowest">
              <img
                alt="Dashboard Preview"
                className="w-full h-auto object-cover opacity-90"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuB-a2o9Vn7AwZcuTBwC-7TZxzZjAqzo2FPVhaEsfmdH5HDby1MZgKZ9UARU2niDYKLBq2JbCqyxA_wL2OD4xhCipIvIIJdZslqyppbnbiCvBjcrxFN2X2YsxI-6woc1RKNY2oadG7OIcp5zxhf3SBHt08IPGg9U81306pLEYilrLAgyby2_O5B294tnrULq7OaSo79aqDtydIwGB7pUDRBHsxgYAXm3dsZa7jngFbHQOoaCHickyzbZ2T3mU7Z7cC9cP91g8uE0w5s"
              />

              {/* Floating Insight Card (Right) */}
              <div className="absolute top-8 right-8 w-64 glass-card p-5 rounded-2xl border border-white/20 peri-glow hidden lg:block text-left z-20">
                <div className="flex items-center gap-2 mb-3">
                  <span className="material-symbols-outlined text-peri-purple text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>
                    insights
                  </span>
                  <span className="font-heading text-[10px] text-on-surface uppercase tracking-wider font-semibold">
                    AI Insight
                  </span>
                </div>
                <p className="font-body text-xs text-on-surface-variant leading-relaxed">
                  "Team velocity has increased by 14%. Recommend shifting Q3 targets."
                </p>
                <div className="mt-4 pt-3 border-t border-white/5 flex gap-2">
                  <button 
                    className="px-3 py-1 bg-peri-purple/20 text-peri-purple rounded-md font-heading text-[10px] font-semibold hover:bg-peri-purple/35 transition-colors cursor-pointer"
                    onClick={() => toast.success('Insight suggestion accepted!')}
                  >
                    Accept
                  </button>
                  <button 
                    className="px-3 py-1 glass-card text-on-surface-variant rounded-md font-heading text-[10px] hover:text-on-surface transition-colors cursor-pointer"
                    onClick={() => toast.info('Insight dismissed.')}
                  >
                    Ignore
                  </button>
                </div>
              </div>

              {/* Floating Active Sprint Card (Left) */}
              <div className="absolute -bottom-6 -left-6 w-72 glass-card p-5 rounded-2xl border border-white/20 electric-glow hidden lg:block text-left z-20">
                <div className="flex justify-between items-center mb-3">
                  <span className="font-heading text-xs font-bold text-electric-blue uppercase tracking-wider">
                    Active Sprint
                  </span>
                  <span className="material-symbols-outlined text-on-surface-variant text-md cursor-pointer hover:text-on-surface transition-colors">
                    more_horiz
                  </span>
                </div>
                <div className="space-y-4">
                  <div className="h-2 bg-surface-container-highest rounded-full overflow-hidden">
                    <div className="w-[75%] h-full bg-electric-blue rounded-full shadow-[0_0_10px_rgba(0,123,255,0.8)]" />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex -space-x-2.5">
                      <img
                        alt="Member"
                        className="w-8 h-8 rounded-full border-2 border-bg-deep object-cover"
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuBnYjDMdiYVS1pbk0EFPK2kfoivNYiy5Ixp6FgtgzZnAvXeMOgbz6_mWpytrexuHnt-Ff1MQrq9E9sfbnqC5BeVA9Nm0xyTaTutS7anuHtQ-8pFGh5TLkHKGUz7KMd5yWO4963drgN7S9R3IrrorJY6bCeACFgeRlYDRs1q_5kSReb8N17BMX8m83IINzRT3KZ36guAZ8JPW7AUnbT5KPaSVmNNpCemoIXK6-Jl_72bsVJ8L824CezznOwpvbvEWwuIxfT7xbRpr3M"
                      />
                      <img
                        alt="Member"
                        className="w-8 h-8 rounded-full border-2 border-bg-deep object-cover"
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuAQKcnYX1RqS5FHIK_TwB7-oVqYuglzsA1s-hp-xXtL1TzDe8UBfqNSBEJpugZeJTf-4Od3sSQnH9vVsR_uA6KM5w2KlrWH3ZOMcX7Xk1O7bLqnTeto_4E65omw2Vlb-c1mJxYDgqBqB-GTWD6Ql_1rcf9TdZ-N5f4uAb8I2VRgiHY1a2sNWtqqLZfYafUKLWyuwcvxh6WqyeIRCvwiofX19fSUwr22TnO4YQs2IXN7oR5F_0ORaeDrZvRBpEWG0fdANQMHPEzpUFM"
                      />
                      <div className="w-8 h-8 rounded-full bg-surface-container-high border-2 border-bg-deep flex items-center justify-center font-heading text-[10px] text-on-surface-variant font-bold">
                        +4
                      </div>
                    </div>
                    <span className="font-heading text-[10px] text-on-surface-variant uppercase tracking-wider font-semibold">
                      75% Complete
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Autonomous Workflows Section */}
        <section id="product" className="max-w-7xl mx-auto px-6 md:px-8 mb-24">
          <div className="text-center mb-16">
            <h2 className="font-heading text-3xl font-bold text-on-surface tracking-tight mb-4">
              Autonomous Workflows
            </h2>
            <p className="font-body text-sm text-on-surface-variant max-w-md mx-auto">
              Neural engines that learn your team's rhythm and automate alignment.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card hoverable className="p-8 group border border-border-low transition-all duration-300 hover:-translate-y-1">
              <div className="w-12 h-12 rounded-xl bg-electric-blue/10 flex items-center justify-center mb-6 text-electric-blue group-hover:bg-electric-blue/20 transition-colors">
                <span className="material-symbols-outlined text-[24px]">neurology</span>
              </div>
              <h3 className="font-heading text-lg font-bold text-on-surface mb-3">
                Self-Healing Backlogs
              </h3>
              <p className="font-body text-xs text-on-surface-variant leading-relaxed">
                The AI identifies stalled tickets and automatically reassigns them based on team capacity and skill set.
              </p>
            </Card>

            <Card hoverable className="p-8 group border border-border-low transition-all duration-300 hover:-translate-y-1">
              <div className="w-12 h-12 rounded-xl bg-peri-purple/10 flex items-center justify-center mb-6 text-peri-purple group-hover:bg-peri-purple/20 transition-colors">
                <span className="material-symbols-outlined text-[24px]">smart_toy</span>
              </div>
              <h3 className="font-heading text-lg font-bold text-on-surface mb-3">
                Contextual Briefings
              </h3>
              <p className="font-body text-xs text-on-surface-variant leading-relaxed">
                Start your day with a hyper-personalized briefing generated from your project updates and workspace logs.
              </p>
            </Card>

            <Card hoverable className="p-8 group border border-border-low transition-all duration-300 hover:-translate-y-1">
              <div className="w-12 h-12 rounded-xl bg-on-surface/10 flex items-center justify-center mb-6 text-on-surface group-hover:bg-on-surface/20 transition-colors">
                <span className="material-symbols-outlined text-[24px]">verified_user</span>
              </div>
              <h3 className="font-heading text-lg font-bold text-on-surface mb-3">
                Risk Prediction
              </h3>
              <p className="font-body text-xs text-on-surface-variant leading-relaxed">
                Identify roadmap delays before they happen. AI monitors external dependencies and alerts you in real-time.
              </p>
            </Card>
          </div>
        </section>

        {/* Split Feature Highlights Section */}
        <section className="max-w-7xl mx-auto px-6 md:px-8 mb-24">
          <div className="glass-card rounded-[32px] md:rounded-[40px] p-8 md:p-14 overflow-hidden relative border border-border-low">
            <div className="absolute top-0 right-0 w-1/2 h-full bg-electric-blue/10 blur-[100px] -z-10 pointer-events-none" />
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="font-heading text-2xl md:text-3.5xl font-extrabold text-on-surface mb-8 leading-tight tracking-tight">
                  Master Complexity with <br />
                  <span className="text-peri-purple">Predictive Intelligence</span>
                </h2>

                <ul className="space-y-6">
                  <li className="flex items-start gap-4">
                    <span className="material-symbols-outlined text-electric-blue mt-0.5 text-xl">
                      check_circle
                    </span>
                    <div>
                      <h4 className="font-heading text-sm font-bold text-on-surface">
                        Dynamic Resource Mapping
                      </h4>
                      <p className="font-body text-xs text-on-surface-variant mt-1 leading-relaxed">
                        Balance workloads instantly with drag-and-drop AI rebalancing and real-time skill alignment.
                      </p>
                    </div>
                  </li>
                  
                  <li className="flex items-start gap-4">
                    <span className="material-symbols-outlined text-electric-blue mt-0.5 text-xl">
                      check_circle
                    </span>
                    <div>
                      <h4 className="font-heading text-sm font-bold text-on-surface">
                        Universal Connector
                      </h4>
                      <p className="font-body text-xs text-on-surface-variant mt-1 leading-relaxed">
                        Sync with Jira, GitHub, Notion, and Slack in a single unified enterprise workspace thread.
                      </p>
                    </div>
                  </li>

                  <li className="flex items-start gap-4">
                    <span className="material-symbols-outlined text-electric-blue mt-0.5 text-xl">
                      check_circle
                    </span>
                    <div>
                      <h4 className="font-heading text-sm font-bold text-on-surface">
                        Enterprise-Grade Security
                      </h4>
                      <p className="font-body text-xs text-on-surface-variant mt-1 leading-relaxed">
                        SOC2 Type II compliant with dedicated private cloud instances and end-to-end data encryption.
                      </p>
                    </div>
                  </li>
                </ul>
              </div>

              <div className="relative">
                <div className="aspect-square rounded-[24px] md:rounded-[32px] overflow-hidden glass-card border border-white/5 shadow-2xl relative">
                  <img
                    alt="AI Network"
                    className="w-full h-full object-cover opacity-80"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuAQ2l8B5rH8sYWp1lBYgI4m2AO4oluplbhLJ8kvc57VUF9xhonvqiqhsdjWvkIu7FBba-HfwlJtib8K61DsBUwMPIpYXjwU2Ug9nG6bxpOlS4NB4MsX90ajd8VSsuEPHMakef-LbMLRgWFQwVlUUzAulS6_tCVPglkUzi76t8ZXbgLlAtWHBK8Hzw5xpy8pF12WusVFwYWQkE3yfJU0CPFNzi-bh-hodTbNDnxLuSp2pBQ4Yw9n7i557TYLSHezXEyoaZAur6y_MjM"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/10">
                    <div className="p-8 rounded-full bg-surface-container-lowest/80 border border-peri-purple/30 shadow-2xl animate-pulse">
                      <span className="material-symbols-outlined text-peri-purple text-5xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                        hub
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Grid Section */}
        <section className="max-w-7xl mx-auto px-6 md:px-8 mb-24">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="md:col-span-2 p-10 flex flex-col justify-between aspect-video md:aspect-auto border border-border-low">
              <h3 className="font-heading text-2xl md:text-3xl font-bold leading-tight text-on-surface mb-6">
                Global Scale <br /> Performance
              </h3>
              <div className="flex items-end justify-between mt-auto">
                <span className="font-heading text-5xl font-extrabold text-electric-blue leading-none">
                  99.9%
                </span>
                <span className="font-heading text-[10px] uppercase tracking-widest text-on-surface-variant font-bold pb-1">
                  Uptime SLA
                </span>
              </div>
            </Card>

            <Card className="p-10 flex flex-col justify-between border border-border-low">
              <span className="material-symbols-outlined text-peri-purple text-4xl mb-6 self-start">
                language
              </span>
              <div className="mt-auto">
                <h4 className="font-heading text-2xl font-bold text-on-surface mb-1">
                  24/7
                </h4>
                <p className="font-heading text-[10px] text-on-surface-variant uppercase tracking-wider font-bold">
                  Global Concierge Support
                </p>
              </div>
            </Card>

            <Card className="p-10 flex flex-col justify-between border border-border-low">
              <span className="material-symbols-outlined text-electric-blue text-4xl mb-6 self-start">
                bolt
              </span>
              <div className="mt-auto">
                <h4 className="font-heading text-2xl font-bold text-on-surface mb-1">
                  &lt;50ms
                </h4>
                <p className="font-heading text-[10px] text-on-surface-variant uppercase tracking-wider font-bold">
                  Action Latency
                </p>
              </div>
            </Card>
          </div>
        </section>
      </main>

      {/* Global Bottom Footer */}
      <footer className="py-20 bg-surface-container-lowest border-t border-border-low">
        <div className="max-w-7xl mx-auto px-6 md:px-8">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-12 mb-20">
            <div className="md:col-span-2">
              <div className="flex items-center gap-2 mb-6">
                <span className="material-symbols-outlined text-electric-blue text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                  tactic
                </span>
                <span className="font-heading text-lg font-bold text-on-surface">
                  AI Smart Team Planner
                </span>
              </div>
              <p className="font-body text-xs text-on-surface-variant max-w-xs leading-relaxed">
                Redefining the architecture of modern enterprise productivity through sovereign AI and proactive orchestration.
              </p>
            </div>
            
            <div>
              <h5 className="font-heading text-[10px] uppercase tracking-widest text-on-surface font-bold mb-6">
                Company
              </h5>
              <ul className="space-y-4 font-body text-xs text-on-surface-variant">
                <li><a className="hover:text-electric-blue transition-colors cursor-pointer" onClick={() => toast.info('About page is coming soon!')}>About</a></li>
                <li><a className="hover:text-electric-blue transition-colors cursor-pointer" onClick={() => toast.info('Careers page is coming soon!')}>Careers</a></li>
                <li><a className="hover:text-electric-blue transition-colors cursor-pointer" onClick={() => toast.info('Manifesto page is coming soon!')}>Manifesto</a></li>
                <li><a className="hover:text-electric-blue transition-colors cursor-pointer" onClick={() => toast.info('Contact details: sales@orchist.ai')}>Contact</a></li>
              </ul>
            </div>

            <div>
              <h5 className="font-heading text-[10px] uppercase tracking-widest text-on-surface font-bold mb-6">
                Resources
              </h5>
              <ul className="space-y-4 font-body text-xs text-on-surface-variant">
                <li><a className="hover:text-electric-blue transition-colors cursor-pointer" onClick={() => toast.info('Documentation is available inside the app.')}>Documentation</a></li>
                <li><a className="hover:text-electric-blue transition-colors cursor-pointer" onClick={() => toast.info('API Status: All operational')}>API Status</a></li>
                <li><a className="hover:text-electric-blue transition-colors cursor-pointer" onClick={() => toast.info('Community forum coming soon!')}>Community</a></li>
                <li><a className="hover:text-electric-blue transition-colors cursor-pointer" onClick={() => toast.info('Trust Center details: SOC2 Type II')}>Trust Center</a></li>
              </ul>
            </div>

            <div>
              <h5 className="font-heading text-[10px] uppercase tracking-widest text-on-surface font-bold mb-6">
                Social
              </h5>
              <ul className="space-y-4 font-body text-xs text-on-surface-variant">
                <li><a className="hover:text-electric-blue transition-colors cursor-pointer" onClick={() => toast.info('Follow us on X: @OrchistAI')}>X / Twitter</a></li>
                <li><a className="hover:text-electric-blue transition-colors cursor-pointer" onClick={() => toast.info('Connect on LinkedIn: Orchist AI')}>LinkedIn</a></li>
                <li><a className="hover:text-electric-blue transition-colors cursor-pointer" onClick={() => toast.info('Source code: @orchist/planner')}>GitHub</a></li>
                <li><a className="hover:text-electric-blue transition-colors cursor-pointer" onClick={() => toast.info('Join our Discord server!')}>Discord</a></li>
              </ul>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center justify-between pt-10 border-t border-border-low font-heading text-[10px] text-on-surface-variant tracking-wider uppercase font-semibold">
            <p>© 2026 AI Smart Team Planner. All rights reserved.</p>
            <div className="flex gap-8 mt-6 md:mt-0">
              <a className="hover:text-on-surface transition-colors cursor-pointer" onClick={() => toast.info('Privacy Policy details coming soon!')}>Privacy Policy</a>
              <a className="hover:text-on-surface transition-colors cursor-pointer" onClick={() => toast.info('Terms of Service details coming soon!')}>Terms of Service</a>
              <a className="hover:text-on-surface transition-colors cursor-pointer" onClick={() => toast.info('Cookie settings are managed automatically.')}>Cookie Settings</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
