import { useEffect, useMemo, useRef, useState } from 'react'
import * as anime from 'animejs'
import { motion } from 'motion/react'
import ErrorBoundary from './ErrorBoundary'

const pageAccent = {
  home: 'from-cyan-500 to-blue-500',
  dashboard: 'from-indigo-500 to-sky-500',
  upload: 'from-violet-500 to-fuchsia-500',
  processing: 'from-cyan-400 to-sky-500',
  results: 'from-teal-400 to-cyan-500',
  history: 'from-slate-400 to-blue-400',
  reports: 'from-fuchsia-500 to-pink-500',
  settings: 'from-slate-400 to-slate-500',
}

// Basic sanitizer for any displayed file/name values coming from user-controlled sources
function sanitizeName(s: string) {
  return s.replace(/[<>\"'`]/g, '').slice(0, 200)
}

interface PageButtonProps {
  label: string
  active: boolean
  onClick: () => void
}

function PageButton({ label, active, onClick }: PageButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`block w-full text-left rounded-3xl px-4 py-3 text-sm font-medium transition ${
        active ? 'bg-white/10 text-white' : 'text-slate-400 hover:bg-white/5 hover:text-white'
      }`}
    >
      {label}
    </button>
  )
}

interface CardProps {
  title: string
  description: string
  gradient: string
}

function FeaturePanel({ title, description, gradient }: CardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-100px' }}
      transition={{ duration: 0.6 }}
      className="rounded-[32px] border border-white/10 bg-[#0F0F11]/90 p-7 shadow-[0_35px_120px_rgba(67,97,238,0.14)]"
      style={{ backgroundImage: `linear-gradient(to bottom right, rgba(15,15,17,1), rgba(15,15,17,0.9))` }}
    >
      <div
        className="absolute inset-0 rounded-[32px] opacity-50 blur-3xl"
        style={{ background: `linear-gradient(135deg, ${gradient})`, zIndex: -1 }}
      />
      <div className="relative space-y-4">
        <div className="inline-flex rounded-3xl bg-white/5 px-4 py-2 text-xs uppercase tracking-[0.28em] text-cyan-200">
          Premium
        </div>
        <h3 className="text-xl font-semibold text-white tracking-tight">{title}</h3>
        <p className="text-slate-300 leading-7">{description}</p>
      </div>
    </motion.div>
  )
}

function HomeSection({ onNavigate }: { onNavigate: (page: string) => void }) {
  const homeRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!homeRef.current) return

    const heroItems = homeRef.current.querySelectorAll('.home-hero-item')
    const featurePanels = homeRef.current.querySelectorAll('.feature-panel')
    const vismeCard = homeRef.current.querySelector('.visme-card')

    // Animate hero items
    anime.animate(heroItems, {
      translateY: [28, 0],
      opacity: [0, 1],
      duration: 800,
      delay: anime.stagger(80),
      easing: 'spring(1, 80, 10, 0)',
    })

    // Animate feature panels
    setTimeout(() => {
      anime.animate(featurePanels, {
        translateY: [24, 0],
        opacity: [0, 1],
        duration: 700,
        delay: anime.stagger(90),
        easing: 'spring(1, 80, 10, 0)',
      })
    }, 200)

    // Animate Visme card
    if (vismeCard) {
      setTimeout(() => {
        anime.animate(vismeCard, {
          scale: [0.98, 1],
          opacity: [0, 1],
          duration: 700,
          easing: 'spring(1, 80, 10, 0)',
        })
      }, 450)
    }
  }, [])

  return (
    <div ref={homeRef} className="space-y-14">
      <motion.section
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative overflow-hidden rounded-[40px] border border-white/10 bg-[#0F0F11]/85 p-8 md:p-12"
      >
        <div className="absolute -right-24 top-20 h-72 w-72 rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="absolute left-10 top-0 h-64 w-64 rounded-full bg-violet-500/10 blur-3xl" />
        <div className="relative z-10 grid gap-10 lg:grid-cols-[1.2fr_0.8fr] items-center">
          <div className="space-y-6">
            <span className="home-hero-item inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-xs uppercase tracking-[0.28em] text-cyan-200" style={{ willChange: 'transform, opacity' }}>
              Live Hackathon AI Platform
            </span>
            <h1 className="home-hero-item text-4xl sm:text-5xl md:text-6xl font-semibold tracking-[-0.04em] text-white" style={{ willChange: 'transform, opacity' }}>
              Solve national-scale challenges with intelligent AI orchestration.
            </h1>
            <p className="home-hero-item max-w-2xl text-base sm:text-lg leading-8 text-slate-300" style={{ willChange: 'transform, opacity' }}>
              Upload diverse data, run high-fidelity AI analysis, and deliver executive-ready recommendations through one secure command center.
            </p>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onNavigate('upload')}
                className="inline-flex items-center justify-center rounded-full bg-cyan-400 px-6 py-3 text-sm font-semibold text-slate-950 transition"
              >
                Get Started
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onNavigate('processing')}
                className="inline-flex items-center justify-center rounded-full border border-white/10 bg-white/5 px-6 py-3 text-sm font-semibold text-white transition"
              >
                Watch Demo
              </motion.button>
            </div>
          </div>
          <div className="relative rounded-[32px] border border-white/10 bg-white/5 p-6 shadow-[0_40px_120px_rgba(67,97,238,0.18)]">
            <div className="absolute inset-x-0 top-0 h-40 rounded-[32px] bg-gradient-to-br from-cyan-500/20 via-blue-500/10 to-transparent blur-3xl" />
            <div className="relative rounded-[28px] border border-white/10 bg-[#050505] p-6">
              <div className="mb-6 flex items-center justify-between text-slate-300">
                <span className="text-xs uppercase tracking-[0.3em]">Live Summary</span>
                <span className="text-xs text-emerald-300">Active</span>
              </div>
              <div className="space-y-5">
                <div className="rounded-3xl bg-[#09090B] p-5">
                  <div className="text-sm text-slate-400">Current pipeline</div>
                  <div className="mt-3 flex items-end gap-3">
                    <div className="text-3xl font-semibold text-white">92%</div>
                    <div className="text-xs uppercase tracking-[0.25em] text-slate-500">confidence</div>
                  </div>
                </div>
                <div className="rounded-3xl bg-[#09090B] p-5">
                  <div className="text-sm text-slate-400">Recent insight</div>
                  <p className="mt-3 text-sm leading-6 text-slate-300">
                    The system flagged a potential infrastructure failure in the western corridor and generated a mitigation sequence.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      <motion.section
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-100px' }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="space-y-8"
      >
        <div className="space-y-4">
          <p className="text-sm uppercase tracking-[0.34em] text-slate-400">Features</p>
          <h2 className="text-3xl font-semibold text-white">AI capabilities built for decisive results.</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {features.map((feature) => (
            <motion.div
              key={feature.title}
              whileHover={{ y: -6 }}
              className="feature-panel rounded-[32px] border border-white/10 bg-[#0F0F11]/90 p-6 shadow-[0_35px_70px_rgba(8,13,28,0.35)]"
              style={{ willChange: 'transform, opacity' }}
            >
              <div className={`mb-4 inline-flex rounded-3xl bg-gradient-to-r ${feature.accent} px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-white`}>
                {feature.title}
              </div>
              <p className="text-slate-300 leading-7">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </motion.section>

      <motion.section
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-100px' }}
        transition={{ duration: 0.8, delay: 0.3 }}
        className="grid gap-4 lg:grid-cols-4"
      >
        {processSteps.map((step) => (
          <div key={step.step} className="rounded-[28px] border border-white/10 bg-[#0F0F11]/90 p-6 text-white">
            <div className="mb-3 text-sm uppercase tracking-[0.3em] text-cyan-300">Step</div>
            <h3 className="text-xl font-semibold">{step.step}</h3>
            <p className="mt-3 text-slate-300 leading-7">{step.label}</p>
          </div>
        ))}
      </motion.section>

      <motion.section
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-100px' }}
        transition={{ duration: 0.8, delay: 0.4 }}
        className="grid gap-6 lg:grid-cols-3"
      >
        {benefitCards.map((item) => (
          <FeaturePanel key={item.title} title={item.title} description={item.description} gradient={item.gradient} />
        ))}
      </motion.section>

      <motion.section
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-100px' }}
        transition={{ duration: 0.8, delay: 0.5 }}
        className="rounded-[32px] border border-white/10 bg-[#0F0F11]/90 p-6 visme-card"
        style={{ willChange: 'transform, opacity' }}
      >
        <div className="space-y-6">
          <div>
            <h2 className="text-sm uppercase tracking-[0.34em] text-slate-400">Event Sign-Up</h2>
            <p className="mt-3 text-slate-300 leading-7">
              Register for the live AI platform demo and see how mission-readiness scales with intelligent workflows.
            </p>
          </div>
          <div className="rounded-[28px] border border-white/10 bg-[#000000]/100 p-4 shadow-[0_20px_80px_rgba(0,0,0,0.35)] overflow-hidden">
            <div className="rounded-[24px] overflow-hidden bg-[#000000] p-2 shadow-[0_20px_80px_rgba(0,0,0,0.4)]">
              <div
                className="visme_d"
                data-title="Online Event Sign Up Form"
                data-url="rzn7ye08-online-event-sign-up-form"
                data-domain="forms"
                data-full-page="false"
                data-min-height="720"
                data-form-id="186603"
                style={{ backgroundColor: '#000000', minHeight: '720px', width: '100%' }}
              />
            </div>
          </div>
        </div>
      </motion.section>
    </div>
  )
}

function AuthSection({ currentPage, onNavigate }: { currentPage: string; onNavigate: (page: string) => void }) {
  const isLogin = currentPage === 'login'
  const isSignUp = currentPage === 'signup'
  const isForgot = currentPage === 'forgot'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const validateEmail = (e: string) => /\S+@\S+\.\S+/.test(e)

  const handleSubmit = () => {
    setError('')
    if (!validateEmail(email)) {
      setError('Please enter a valid email address')
      return
    }
    if (!isForgot && password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }
    // Placeholder success action - integrate real auth here
    alert(isForgot ? 'Recovery email sent (demo)' : isSignUp ? 'Account created (demo)' : 'Logged in (demo)')
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      className="rounded-[36px] border border-white/10 bg-[#0F0F11]/95 p-8 shadow-[0_40px_100px_rgba(8,14,30,0.45)]"
    >
      <div className="grid gap-8 lg:grid-cols-[0.9fr_0.8fr]">
        <div className="space-y-4">
          <p className="text-sm uppercase tracking-[0.32em] text-cyan-300">Secure access</p>
          <h2 className="text-3xl font-semibold text-white">Access the AI command center for critical insights.</h2>
          <p className="max-w-xl text-slate-300 leading-7">
            Authenticate with modern security and then manage your analysis workflow from a premium dashboard experience.
          </p>
        </div>
        <div className="rounded-[32px] border border-white/10 bg-[#050505]/90 p-6 backdrop-blur-xl">
          <div className="mb-6 flex items-center justify-between gap-3">
            <button
              onClick={() => onNavigate('login')}
              className={`flex-1 rounded-3xl px-4 py-3 text-sm font-semibold transition ${
                isLogin ? 'bg-cyan-400 text-slate-950' : 'bg-white/5 text-slate-300 hover:bg-white/10'
              }`}
            >
              Login
            </button>
            <button
              onClick={() => onNavigate('signup')}
              className={`flex-1 rounded-3xl px-4 py-3 text-sm font-semibold transition ${
                isSignUp ? 'bg-cyan-400 text-slate-950' : 'bg-white/5 text-slate-300 hover:bg-white/10'
              }`}
            >
              Sign Up
            </button>
          </div>

          <div className="space-y-4">
            <label htmlFor="auth-email" className="block text-sm font-medium text-slate-300">Email</label>
            <input id="auth-email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="team@organization.ai" aria-label="Email" className="w-full rounded-3xl border border-white/10 bg-[#09101C] px-4 py-3 text-white outline-none transition focus:border-cyan-400/40" />
            <label htmlFor="auth-password" className="block text-sm font-medium text-slate-300">Password</label>
            <input id="auth-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter secure password" aria-label="Password" className="w-full rounded-3xl border border-white/10 bg-[#09101C] px-4 py-3 text-white outline-none transition focus:border-cyan-400/40" />

            {isForgot && (
              <p className="rounded-3xl bg-white/5 p-4 text-sm text-slate-300">
                Enter your email and we will send a secure recovery link to regain access.
              </p>
            )}

            {error && <div className="text-sm text-rose-400">{error}</div>}
            <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.97 }} onClick={handleSubmit} className="w-full rounded-3xl bg-cyan-400 px-5 py-3 text-sm font-semibold text-slate-950">
              {isSignUp ? 'Create Account' : isForgot ? 'Send Recovery Email' : 'Continue'}
            </motion.button>
          </div>

          <div className="mt-6 flex items-center justify-between gap-3 text-xs uppercase tracking-[0.28em] text-slate-500">
            <button onClick={() => onNavigate('forgot')} className="text-white/80 hover:text-white">
              Forgot Password?
            </button>
            <span className="text-slate-600">or</span>
            <button onClick={() => onNavigate('home')} className="text-white/80 hover:text-white">
              Back Home
            </button>
          </div>
        </div>
      </div>
    </motion.section>
  )
}

function DashboardSection() {
  return (
    <div className="space-y-8">
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]"
      >
        <div className="rounded-[32px] border border-white/10 bg-[#0F0F11]/95 p-8 shadow-[0_40px_120px_rgba(8,14,30,0.45)]">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.34em] text-slate-400">Overview</p>
              <h2 className="mt-3 text-3xl font-semibold text-white">Operational dashboard</h2>
            </div>
            <div className="rounded-3xl bg-white/5 px-4 py-3 text-sm text-slate-300">Live system status: Stable</div>
          </div>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {quickStats.map((stat) => (
              <div key={stat.label} className="rounded-[28px] border border-white/10 bg-[#050505]/80 p-5">
                <p className="text-sm uppercase tracking-[0.3em] text-slate-500">{stat.label}</p>
                <p className="mt-3 text-3xl font-semibold text-white">{stat.value}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[32px] border border-white/10 bg-[#0F0F11]/95 p-8 shadow-[0_40px_120px_rgba(8,14,30,0.45)]">
          <p className="text-sm uppercase tracking-[0.34em] text-slate-400">Analytics</p>
          <div className="mt-6 space-y-6">
            <div className="rounded-[28px] bg-[#050505]/80 p-5">
              <div className="flex items-center justify-between gap-4 text-slate-300">
                <div>
                  <p className="text-sm uppercase tracking-[0.28em]">Processing Trends</p>
                  <p className="mt-2 text-lg font-semibold text-white">Stable throughput across AI workloads</p>
                </div>
                <span className="rounded-full bg-cyan-500/15 px-3 py-1 text-xs uppercase text-cyan-200">+12%</span>
              </div>
              <div className="mt-4 h-32 rounded-[24px] bg-gradient-to-r from-cyan-500/20 via-transparent to-transparent" />
            </div>
            <div className="rounded-[28px] bg-[#050505]/80 p-5">
              <div className="flex items-center justify-between gap-4 text-slate-300">
                <div>
                  <p className="text-sm uppercase tracking-[0.28em]">Activity Graph</p>
                  <p className="mt-2 text-lg font-semibold text-white">User engagement across projects</p>
                </div>
                <span className="rounded-full bg-violet-500/15 px-3 py-1 text-xs uppercase text-violet-200">Live</span>
              </div>
              <div className="mt-4 h-32 rounded-[24px] bg-gradient-to-r from-violet-500/20 via-transparent to-transparent" />
            </div>
          </div>
        </div>
      </motion.section>

      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.1 }}
        className="grid gap-6 xl:grid-cols-2"
      >
        <div className="rounded-[32px] border border-white/10 bg-[#0F0F11]/95 p-8">
          <div className="flex items-center justify-between text-slate-300">
            <h3 className="text-lg font-semibold text-white">Recent Activity</h3>
            <span className="text-xs uppercase tracking-[0.28em] text-slate-500">Today</span>
          </div>
          <div className="mt-6 space-y-4">
            {historyRows.slice(0, 3).map((item) => (
              <div key={item.file} className="rounded-[24px] border border-white/10 bg-[#050505]/80 p-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="font-medium text-white">{item.file}</p>
                    <p className="text-sm text-slate-400">{item.date}</p>
                  </div>
                  <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs text-emerald-200">{item.status}</span>
                </div>
                <div className="mt-3 flex items-center justify-between text-sm text-slate-400">
                  <span>Score: {item.score}</span>
                  <button className="text-cyan-300 hover:text-cyan-100">View</button>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-[32px] border border-white/10 bg-[#0F0F11]/95 p-8">
          <p className="text-sm uppercase tracking-[0.34em] text-slate-400">Insights</p>
          <div className="mt-6 space-y-4">
            <div className="rounded-[28px] bg-[#050505]/80 p-5">
              <h4 className="font-semibold text-white">AI Summary</h4>
              <p className="mt-3 text-slate-300 leading-7">
                The algorithm prioritized high-impact scenarios and surfaced targeted recommendations for infrastructure resilience.
              </p>
            </div>
            <div className="rounded-[28px] bg-[#050505]/80 p-5">
              <h4 className="font-semibold text-white">Processing Efficiency</h4>
              <p className="mt-3 text-slate-300 leading-7">
                The platform delivered response times under 18 seconds across the latest batch of uploads.
              </p>
            </div>
          </div>
        </div>
      </motion.section>
    </div>
  )
}

function UploadSection() {
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [dragActive, setDragActive] = useState(false)

  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(e.type === 'dragenter' || e.type === 'dragover')
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setUploadedFiles(Array.from(e.dataTransfer.files))
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploadedFiles(Array.from(e.target.files))
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      className="space-y-8"
    >
      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-[32px] border border-white/10 bg-[#0F0F11]/95 p-8">
          <div className="flex items-center justify-between gap-4 text-slate-300">
            <div>
              <p className="text-sm uppercase tracking-[0.34em]">Upload</p>
              <h2 className="mt-3 text-3xl font-semibold text-white">Upload files for AI review.</h2>
            </div>
            <span className="rounded-full bg-cyan-500/10 px-3 py-1 text-xs uppercase tracking-[0.28em] text-cyan-200">Supported types</span>
          </div>
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`mt-8 cursor-pointer rounded-[32px] border border-dashed p-10 text-center transition ${
              dragActive
                ? 'border-cyan-400 bg-cyan-500/10'
                : 'border-white/10 bg-[#050505]/80 hover:border-cyan-400/50 hover:bg-cyan-500/5'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              onChange={handleFileChange}
              className="hidden"
              accept="image/*,.pdf,.doc,.docx,.txt"
            />
            <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-cyan-500/10 text-cyan-300">
              <Upload size={28} />
            </div>
            <h3 className="text-xl font-semibold text-white">
              {uploadedFiles.length > 0 ? `${uploadedFiles.length} file(s) selected` : 'Drag & drop files or browse'}
            </h3>
            <p className="mt-3 text-slate-400 leading-7">
              {uploadedFiles.length > 0
                ? uploadedFiles.map((f) => sanitizeName(f.name)).join(', ')
                : 'Images, documents, PDFs, and structured text are all supported for comprehensive analysis.'}
            </p>
          </div>
        </div>
        <div className="space-y-6 rounded-[32px] border border-white/10 bg-[#0F0F11]/95 p-8">
          <div className="rounded-[28px] bg-[#050505]/80 p-6">
            <p className="text-sm uppercase tracking-[0.28em] text-slate-500">AI Model</p>
            <h3 className="mt-3 text-lg font-semibold text-white">National Intelligence v4</h3>
          </div>
          <div className="rounded-[28px] bg-[#050505]/80 p-6">
            <p className="text-sm uppercase tracking-[0.28em] text-slate-500">Processing Mode</p>
            <h3 className="mt-3 text-lg font-semibold text-white">Secure Real-Time</h3>
          </div>
          <div className="rounded-[28px] bg-[#050505]/80 p-6">
            <p className="text-sm uppercase tracking-[0.28em] text-slate-500">Analysis Depth</p>
            <h3 className="mt-3 text-lg font-semibold text-white">Full strategic review</h3>
          </div>
          <motion.div whileHover={{ y: -2 }} className="grid gap-4">
            <button className="rounded-full bg-cyan-400 px-5 py-3 text-sm font-semibold text-slate-950 disabled:opacity-50" disabled={uploadedFiles.length === 0}>Start Analysis</button>
            <button onClick={() => setUploadedFiles([])} className="rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white">Reset Inputs</button>
          </motion.div>
        </div>
      </div>
    </motion.div>
  )
}

function ProcessingSection() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]"
    >
      <div className="rounded-[32px] border border-white/10 bg-[#0F0F11]/95 p-8 shadow-[0_40px_120px_rgba(8,14,30,0.45)]">
        <div className="text-sm uppercase tracking-[0.34em] text-slate-400">Processing</div>
        <h2 className="mt-4 text-3xl font-semibold text-white">AI workflow in motion.</h2>
        <p className="mt-4 text-slate-300 leading-7">
          The platform validates and processes your submission through a secure pipeline while keeping you updated on every stage.
        </p>
        <div className="mt-10 flex items-center justify-center">
          <div className="relative flex h-56 w-56 items-center justify-center rounded-full bg-gradient-to-br from-cyan-500/10 via-violet-500/10 to-transparent">
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-cyan-500/50 via-blue-500/20 to-transparent blur-2xl" />
            <div className="relative flex h-28 w-28 items-center justify-center rounded-full bg-[#050505] border border-cyan-400/15 shadow-[0_0_80px_rgba(67,97,238,0.25)]">
              <span className="text-5xl font-semibold text-white">68%</span>
            </div>
          </div>
        </div>
      </div>
      <div className="space-y-6 rounded-[32px] border border-white/10 bg-[#0F0F11]/95 p-8">
        <div className="rounded-[28px] bg-[#050505]/80 p-6">
          <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Timeline</p>
          <div className="mt-6 space-y-4">
            {['Upload Complete', 'Validation', 'AI Analysis', 'Report Generation', 'Complete'].map((stage, index) => (
              <div key={stage} className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-cyan-400/10 text-cyan-300">
                  {index + 1}
                </div>
                <div>
                  <p className="font-medium text-white">{stage}</p>
                  <p className="text-sm text-slate-400">{index === 2 ? 'In progress' : index < 2 ? 'Completed' : 'Pending'}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-[28px] bg-[#050505]/80 p-6">
          <div className="flex items-center justify-between text-slate-300">
            <p className="text-sm uppercase tracking-[0.28em]">Live logs</p>
            <p className="text-sm text-cyan-300">Est. 42s remaining</p>
          </div>
          <div className="mt-4 space-y-3 text-sm text-slate-300">
            <p>Initializing secure upload ecosystem...</p>
            <p>Verifying document schemas and metadata...</p>
            <p>Applying model ensemble to detect trends...</p>
            <p>Generating exportable recommendations...</p>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

function ResultsSection() {
  return (
    <div className="space-y-8">
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="rounded-[32px] border border-white/10 bg-[#0F0F11]/95 p-8"
      >
        <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-[28px] bg-[#050505]/90 p-8">
            <p className="text-sm uppercase tracking-[0.34em] text-slate-400">Analysis Complete</p>
            <h2 className="mt-4 text-3xl font-semibold text-white">Insight package ready.</h2>
            <p className="mt-4 text-slate-300 leading-7">
              AI has processed your files and generated a confidence-rated report that is ready for decision-makers.
            </p>
          </div>
          <div className="rounded-[28px] bg-gradient-to-br from-cyan-500/15 via-blue-500/10 to-transparent p-8">
            <div className="rounded-[28px] bg-[#050505]/90 p-6">
              <div className="flex items-center justify-between gap-4 text-slate-300">
                <div>
                  <p className="text-sm uppercase tracking-[0.28em]">Confidence</p>
                  <p className="mt-2 text-4xl font-semibold text-white">92%</p>
                </div>
                <button className="rounded-full bg-cyan-400 px-4 py-2 text-sm font-semibold text-slate-950">Download</button>
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.1 }}
        className="grid gap-6 lg:grid-cols-2"
      >
        {[
          { label: 'Accuracy', value: '96.4%' },
          { label: 'Confidence', value: '92%' },
          { label: 'Processing Time', value: '18s' },
          { label: 'Key Findings', value: '7 flagged scenarios' },
        ].map((metric) => (
          <div key={metric.label} className="rounded-[28px] border border-white/10 bg-[#0F0F11]/95 p-6">
            <p className="text-sm uppercase tracking-[0.28em] text-slate-500">{metric.label}</p>
            <p className="mt-4 text-3xl font-semibold text-white">{metric.value}</p>
          </div>
        ))}
      </motion.section>

      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="grid gap-6 lg:grid-cols-2"
      >
        <div className="rounded-[32px] border border-white/10 bg-[#0F0F11]/95 p-8">
          <h3 className="text-xl font-semibold text-white">AI Summary</h3>
          <p className="mt-4 text-slate-300 leading-7">
            The platform identified the strongest patterns across uploaded documents and surfaced prioritized recommendations for mitigation, logistics, and resource coordination.
          </p>
        </div>
        <div className="rounded-[32px] border border-white/10 bg-[#0F0F11]/95 p-8">
          <h3 className="text-xl font-semibold text-white">Highlights</h3>
          <ul className="mt-4 space-y-3 text-slate-300">
            <li>• High-risk infrastructure dependency detected in sector network.</li>
            <li>• Resource allocation imbalance affecting response time.</li>
            <li>• Predictive signal suggests surge in demand over 48 hours.</li>
          </ul>
        </div>
      </motion.section>

      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.3 }}
        className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]"
      >
        <div className="rounded-[32px] border border-white/10 bg-[#0F0F11]/95 p-8">
          <div className="h-56 rounded-[28px] bg-gradient-to-br from-cyan-500/10 via-blue-500/10 to-transparent" />
        </div>
        <div className="rounded-[32px] border border-white/10 bg-[#0F0F11]/95 p-8">
          <div className="space-y-4">
            <div>
              <p className="text-sm uppercase tracking-[0.28em] text-slate-500">Recommendations</p>
              <p className="mt-3 text-slate-300 leading-7">
                Prioritize resilience actions, dispatch support teams, and archive the most urgent insights into executive reports.
              </p>
            </div>
            <div className="grid gap-3">
              {['Export PDF', 'Export CSV', 'Export DOCX'].map((label) => (
                <button key={label} className="rounded-3xl bg-white/5 px-4 py-3 text-left text-sm text-white transition hover:bg-white/10">
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </motion.section>
    </div>
  )
}

function HistorySection() {
  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="rounded-[32px] border border-white/10 bg-[#0F0F11]/95 p-8"
      >
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.34em] text-slate-400">History</p>
            <h2 className="mt-3 text-3xl font-semibold text-white">Track every analysis.</h2>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <input placeholder="Date range" className="rounded-3xl border border-white/10 bg-[#050505]/80 px-4 py-3 text-sm text-white outline-none" />
            <input placeholder="Filter by status" className="rounded-3xl border border-white/10 bg-[#050505]/80 px-4 py-3 text-sm text-white outline-none" />
          </div>
        </div>
        <div className="mt-8 overflow-x-auto rounded-[28px] border border-white/10 bg-[#050505]/90">
          <table className="min-w-full text-left text-sm text-slate-300">
            <thead className="border-b border-white/10 text-slate-500">
              <tr>
                <th className="px-6 py-4">File</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Score</th>
                <th className="px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {historyRows.map((row) => (
                <tr key={row.file} className="border-b border-white/10">
                  <td className="px-6 py-4 font-medium text-white">{row.file}</td>
                  <td className="px-6 py-4">{row.date}</td>
                  <td className="px-6 py-4 text-cyan-300">{row.status}</td>
                  <td className="px-6 py-4">{row.score}</td>
                  <td className="px-6 py-4">
                    <button className="rounded-full bg-white/5 px-4 py-2 text-xs uppercase tracking-[0.28em] text-slate-300 hover:bg-white/10">
                      Open
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  )
}

function ReportsSection() {
  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]"
      >
        <div className="space-y-4 rounded-[32px] border border-white/10 bg-[#0F0F11]/95 p-8">
          <h2 className="text-3xl font-semibold text-white">Reports</h2>
          <p className="text-slate-300 leading-7">Browse generated reports and preview the findings before exporting to stakeholders.</p>
          <div className="grid gap-4">
            {reportCards.map((report) => (
              <div key={report.name} className="rounded-[28px] border border-white/10 bg-[#050505]/80 p-5">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="font-semibold text-white">{report.name}</p>
                    <p className="text-sm text-slate-400">{report.date}</p>
                  </div>
                  <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs uppercase tracking-[0.28em] text-emerald-200">
                    {report.status}
                  </span>
                </div>
                <div className="mt-4 flex items-center gap-3">
                  <button className="rounded-full bg-cyan-400 px-4 py-2 text-sm font-semibold text-slate-950">Download</button>
                  <button className="rounded-full bg-white/5 px-4 py-2 text-sm text-white hover:bg-white/10">Preview</button>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-[32px] border border-white/10 bg-[#0F0F11]/95 p-8">
          <div className="rounded-[28px] border border-white/10 bg-[#050505]/80 p-6">
            <div className="flex items-center justify-between text-slate-300">
              <p className="text-sm uppercase tracking-[0.28em]">Report preview</p>
              <button className="rounded-full bg-white/5 px-3 py-1 text-xs text-white">View</button>
            </div>
            <div className="mt-6 space-y-4">
              <div className="h-12 rounded-2xl bg-gradient-to-r from-cyan-500/20 to-transparent" />
              <div className="h-48 rounded-[24px] bg-[#050505]/80" />
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

function SettingsSection() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      className="grid gap-6 lg:grid-cols-2"
    >
      <div className="rounded-[32px] border border-white/10 bg-[#0F0F11]/95 p-8">
        <h2 className="text-3xl font-semibold text-white">Settings</h2>
        <p className="mt-4 text-slate-300 leading-7">Configure profile, notifications, theme, and AI defaults for your project team.</p>
        <div className="mt-8 space-y-4">
          {settingsOptions.map((option) => (
            <div key={option.label} className="rounded-[28px] border border-white/10 bg-[#050505]/80 p-5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="font-semibold text-white">{option.label}</p>
                  <p className="text-sm text-slate-400">{option.description}</p>
                </div>
                <button className="rounded-full bg-cyan-400 px-4 py-2 text-sm font-semibold text-slate-950">Toggle</button>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="rounded-[32px] border border-white/10 bg-[#0F0F11]/95 p-8">
        <div className="space-y-5">
          <div className="rounded-[28px] bg-[#050505]/80 p-6">
            <p className="text-sm uppercase tracking-[0.28em] text-slate-500">Profile</p>
            <div className="mt-4 space-y-3">
              <div className="rounded-3xl border border-white/10 bg-[#09101C]/70 p-4">Username: command.center</div>
              <div className="rounded-3xl border border-white/10 bg-[#09101C]/70 p-4">Email: operations@hackathon.ai</div>
            </div>
          </div>
          <div className="rounded-[28px] bg-[#050505]/80 p-6">
            <p className="text-sm uppercase tracking-[0.28em] text-slate-500">Theme Settings</p>
            <p className="mt-3 text-slate-300">Dark mode is enabled across the AI console for optimal focus and low-light presentation.</p>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

function App() {
  const [page, setPage] = useState('home')
  const [authPage, setAuthPage] = useState('login')

  const isAuthPage = page === 'login' || page === 'signup' || page === 'forgot'

  useEffect(() => {
    if (typeof window === 'undefined') return

    if (!document.getElementById('vismeforms-script')) {
      let loaded = false
      const script = document.createElement('script')
      script.id = 'vismeforms-script'
      script.src = 'https://static-bundles.visme.co/forms/vismeforms-embed.js'
      script.async = true

      const onLoad = () => {
        loaded = true
        // script loaded successfully
      }

      const onError = () => {
        // Failed to load: remove script and allow fallback UI
        console.warn('Visme embed script failed to load')
        try {
          script.remove()
        } catch (e) {}
      }

      script.addEventListener('load', onLoad)
      script.addEventListener('error', onError)
      document.body.appendChild(script)

      const timeout = window.setTimeout(() => {
        if (!loaded) {
          console.warn('Visme script load timed out; removing script')
          try {
            script.remove()
          } catch (e) {}
        }
      }, 8000)

      return () => {
        clearTimeout(timeout)
        script.removeEventListener('load', onLoad)
        script.removeEventListener('error', onError)
        try {
          script.remove()
        } catch (e) {}
      }
    }
  }, [])

  const content = useMemo(() => {
    switch (page) {
      case 'dashboard':
        return <DashboardSection />
      case 'upload':
        return <UploadSection />
      case 'processing':
        return <ProcessingSection />
      case 'results':
        return <ResultsSection />
      case 'history':
        return <HistorySection />
      case 'reports':
        return <ReportsSection />
      case 'settings':
        return <SettingsSection />
      case 'login':
      case 'signup':
      case 'forgot':
        return <AuthSection currentPage={authPage} onNavigate={(next) => { setPage('login'); setAuthPage(next) }} />
      default:
        return <HomeSection onNavigate={setPage} />
    }
  }, [page, authPage])

  if (page === 'home') {
    return (
      <div className="min-h-screen bg-[#050505] text-white">
        <div className="mx-auto max-w-[1440px] px-4 py-10 sm:px-6 md:px-10">
          {content}
        </div>
      </div>
    )
  }

  if (isAuthPage) {
    return (
      <div className="min-h-screen bg-[#050505] text-white">
        <div className="mx-auto flex min-h-screen max-w-[900px] items-center justify-center px-4 py-10 sm:px-6 md:px-10">
          {content}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      <div className="mx-auto flex min-h-screen max-w-[1440px] flex-col gap-8 px-4 py-6 sm:px-6 md:px-10">
        <header className="flex flex-col gap-6 rounded-[36px] border border-white/10 bg-[#0F0F11]/80 p-6 shadow-[0_40px_80px_rgba(8,14,30,0.35)] backdrop-blur-2xl md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-3 rounded-full bg-white/5 px-4 py-2 text-sm text-cyan-200">
              <Wand2 size={16} />
              Hackathon AI Command Center
            </div>
            <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">Operational console</h1>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {['dashboard', 'upload', 'results'].map((key) => {
              const item = pageNav.find((nav) => nav.key === key)
              return (
                item && (
                  <button key={item.key} onClick={() => setPage(item.key)} className="rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm text-slate-200 transition hover:bg-white/10">
                    {item.label}
                  </button>
                )
              )
            })}
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => { setPage('login'); setAuthPage('login') }} className="rounded-full bg-cyan-400 px-5 py-3 text-sm font-semibold text-slate-950">
              Sign Out
            </motion.button>
          </div>
        </header>

        <div className="grid gap-6 xl:grid-cols-[280px_1fr]">
          <aside className="space-y-4 rounded-[36px] border border-white/10 bg-[#0F0F11]/85 p-5 shadow-[0_35px_90px_rgba(8,14,30,0.28)]">
            <nav className="space-y-2">
              {pageNav.map((item) => (
                <button
                  key={item.key}
                  onClick={() => setPage(item.key)}
                  className={`flex w-full items-center gap-3 rounded-3xl px-4 py-3 text-sm font-medium transition ${
                    page === item.key ? 'bg-cyan-500/15 text-white' : 'text-slate-400 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <item.icon size={18} />
                  {item.label}
                </button>
              ))}
            </nav>
            <div className="rounded-[28px] border border-white/10 bg-[#050505]/80 p-5">
              <p className="text-sm uppercase tracking-[0.32em] text-slate-400">Workspace</p>
              <p className="mt-4 text-lg font-semibold text-white">National response hub</p>
              <p className="mt-3 text-slate-400 leading-6">
                Manage uploads, track AI insights, and export reports from one secure environment.
              </p>
            </div>
          </aside>
          <section className="space-y-8">
            <div className="rounded-[36px] border border-white/10 bg-[#0F0F11]/80 p-6 shadow-[0_35px_90px_rgba(8,14,30,0.28)]">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <p className="text-sm uppercase tracking-[0.32em] text-slate-400">Current page</p>
                  <h2 className="mt-3 text-2xl font-semibold text-white capitalize">{page}</h2>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex items-center gap-2 rounded-full bg-white/5 px-4 py-2 text-sm text-slate-200">
                    <Bell size={16} /> Alerts
                  </div>
                  <div className="flex items-center gap-2 rounded-full bg-white/5 px-4 py-2 text-sm text-slate-200">
                    <Users size={16} /> Team
                  </div>
                </div>
              </div>
            </div>
            {content}
          </section>
        </div>
      </div>
    </div>
  )
}

export default function RootApp() {
  return (
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  )
}
