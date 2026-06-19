# Quick Fix Guide - Critical Issues

## 🔴 Fix #1: Memory Leak in HomeSection Animations

### Current Code (BROKEN)
```typescript
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

    setTimeout(() => {
      anime.animate(featurePanels, {
        translateY: [24, 0],
        opacity: [0, 1],
        duration: 700,
        delay: anime.stagger(90),
        easing: 'spring(1, 80, 10, 0)',
      })
    }, 200)

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
  }, []) // ❌ NO CLEANUP
}
```

### Fixed Code
```typescript
function HomeSection({ onNavigate }: { onNavigate: (page: string) => void }) {
  const homeRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!homeRef.current) return

    const heroItems = homeRef.current.querySelectorAll('.home-hero-item')
    const featurePanels = homeRef.current.querySelectorAll('.feature-panel')
    const vismeCard = homeRef.current.querySelector('.visme-card')

    // Create timeline for managing animations
    const timeline = anime.timeline()

    timeline.add({
      targets: heroItems,
      translateY: [28, 0],
      opacity: [0, 1],
      duration: 800,
      delay: anime.stagger(80),
      easing: 'spring(1, 80, 10, 0)',
    })

    timeline.add({
      targets: featurePanels,
      translateY: [24, 0],
      opacity: [0, 1],
      duration: 700,
      delay: anime.stagger(90),
      easing: 'spring(1, 80, 10, 0)',
    }, 200)

    if (vismeCard) {
      timeline.add({
        targets: vismeCard,
        scale: [0.98, 1],
        opacity: [0, 1],
        duration: 700,
        easing: 'spring(1, 80, 10, 0)',
      }, 450)
    }

    // ✅ CLEANUP FUNCTION
    return () => {
      // Pause and remove animations
      timeline.pause()
      anime.remove(heroItems)
      anime.remove(featurePanels)
      if (vismeCard) anime.remove(vismeCard)
    }
  }, [])

  return (
    <div ref={homeRef} className="space-y-14">
      {/* rest of component */}
    </div>
  )
}
```

---

## 🔴 Fix #2: Visme Script Error Handling

### Current Code (BROKEN)
```typescript
useEffect(() => {
  if (typeof window !== 'undefined' && !document.getElementById('vismeforms-script')) {
    const script = document.createElement('script')
    script.id = 'vismeforms-script'
    script.src = 'https://static-bundles.visme.co/forms/vismeforms-embed.js'
    script.async = true
    document.body.appendChild(script)
    // ❌ NO ERROR HANDLING, NO TIMEOUT
  }
}, [])
```

### Fixed Code
```typescript
useEffect(() => {
  if (typeof window !== 'undefined' && !document.getElementById('vismeforms-script')) {
    const script = document.createElement('script')
    script.id = 'vismeforms-script'
    script.src = 'https://static-bundles.visme.co/forms/vismeforms-embed.js'
    script.async = true
    // ✅ Add SRI for security
    script.integrity = 'sha384-YOUR_CALCULATED_HASH'
    script.crossOrigin = 'anonymous'

    // ✅ Add timeout protection
    const loadTimeout = setTimeout(() => {
      console.warn('Visme script failed to load within 5 seconds')
      document.body.removeChild(script)
    }, 5000)

    // ✅ Add error handler
    script.onerror = () => {
      clearTimeout(loadTimeout)
      console.error('Failed to load Visme embed script')
      // Optionally show fallback UI
    }

    // ✅ Add success handler
    script.onload = () => {
      clearTimeout(loadTimeout)
      console.log('Visme script loaded successfully')
    }

    document.body.appendChild(script)

    // ✅ Cleanup on unmount
    return () => {
      clearTimeout(loadTimeout)
      // Optionally remove script if needed
      if (document.getElementById('vismeforms-script')) {
        document.body.removeChild(script)
      }
    }
  }
}, [])
```

---

## 🔴 Fix #3: Uncontrolled Auth Form Inputs

### Current Code (BROKEN)
```typescript
function AuthSection({ currentPage, onNavigate }: { currentPage: string; onNavigate: (page: string) => void }) {
  const isLogin = currentPage === 'login'
  const isSignUp = currentPage === 'signup'
  const isForgot = currentPage === 'forgot'

  return (
    <motion.section>
      <div className="grid gap-8 lg:grid-cols-[0.9fr_0.8fr]">
        <div className="space-y-4">
          {/* ... */}
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
            <label className="block text-sm font-medium text-slate-300">Email</label>
            <input 
              placeholder="team@organization.ai" 
              // ❌ NO VALUE PROP, NO onChange, NO VALIDATION
              className="w-full rounded-3xl border border-white/10 bg-[#09101C] px-4 py-3 text-white outline-none transition focus:border-cyan-400/40" 
            />
            <label className="block text-sm font-medium text-slate-300">Password</label>
            <input 
              type="password" 
              placeholder="Enter secure password" 
              // ❌ NO VALUE PROP, NO onChange, NO VALIDATION
              className="w-full rounded-3xl border border-white/10 bg-[#09101C] px-4 py-3 text-white outline-none transition focus:border-cyan-400/40" 
            />

            {isForgot && (
              <p className="rounded-3xl bg-white/5 p-4 text-sm text-slate-300">
                Enter your email and we will send a secure recovery link to regain access.
              </p>
            )}

            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.97 }}
              className="w-full rounded-3xl bg-cyan-400 px-5 py-3 text-sm font-semibold text-slate-950"
            >
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
```

### Fixed Code
```typescript
interface AuthFormErrors {
  email: string
  password: string
}

interface AuthFormData {
  email: string
  password: string
}

function AuthSection({ currentPage, onNavigate }: { currentPage: string; onNavigate: (page: string) => void }) {
  const isLogin = currentPage === 'login'
  const isSignUp = currentPage === 'signup'
  const isForgot = currentPage === 'forgot'

  // ✅ CONTROLLED FORM STATE
  const [formData, setFormData] = useState<AuthFormData>({
    email: '',
    password: '',
  })

  const [errors, setErrors] = useState<AuthFormErrors>({
    email: '',
    password: '',
  })

  const [isLoading, setIsLoading] = useState(false)

  // ✅ EMAIL VALIDATION
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  // ✅ PASSWORD VALIDATION
  const validatePassword = (password: string): boolean => {
    return password.length >= 8
  }

  // ✅ FORM VALIDATION
  const validateForm = (): boolean => {
    const newErrors: AuthFormErrors = { email: '', password: '' }
    let isValid = true

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
      isValid = false
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Invalid email format'
      isValid = false
    }

    if (!formData.password) {
      newErrors.password = 'Password is required'
      isValid = false
    } else if (!validatePassword(formData.password)) {
      newErrors.password = 'Password must be at least 8 characters'
      isValid = false
    }

    if (isSignUp && formData.password.length < 12) {
      newErrors.password = 'Sign up requires a stronger password (12+ characters)'
      isValid = false
    }

    setErrors(newErrors)
    return isValid
  }

  // ✅ FORM SUBMISSION
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsLoading(true)

    try {
      // Send to backend
      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          action: isSignUp ? 'signup' : isForgot ? 'forgot' : 'login',
        }),
      })

      if (!response.ok) {
        throw new Error('Auth failed')
      }

      // On success, navigate
      if (isForgot) {
        alert('Check your email for recovery link')
        onNavigate('login')
      } else {
        onNavigate('dashboard')
      }
    } catch (error) {
      console.error('Auth error:', error)
      setErrors(prev => ({
        ...prev,
        password: 'Authentication failed. Please try again.',
      }))
    } finally {
      setIsLoading(false)
    }
  }

  // ✅ INPUT CHANGE HANDLER
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }))
    // Clear error for this field when user starts typing
    setErrors(prev => ({
      ...prev,
      [name]: '',
    }))
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
              type="button"
              onClick={() => {
                onNavigate('login')
                setFormData({ email: '', password: '' })
                setErrors({ email: '', password: '' })
              }}
              aria-pressed={isLogin}
              className={`flex-1 rounded-3xl px-4 py-3 text-sm font-semibold transition ${
                isLogin ? 'bg-cyan-400 text-slate-950' : 'bg-white/5 text-slate-300 hover:bg-white/10'
              }`}
            >
              Login
            </button>
            <button
              type="button"
              onClick={() => {
                onNavigate('signup')
                setFormData({ email: '', password: '' })
                setErrors({ email: '', password: '' })
              }}
              aria-pressed={isSignUp}
              className={`flex-1 rounded-3xl px-4 py-3 text-sm font-semibold transition ${
                isSignUp ? 'bg-cyan-400 text-slate-950' : 'bg-white/5 text-slate-300 hover:bg-white/10'
              }`}
            >
              Sign Up
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-300">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                aria-invalid={!!errors.email}
                aria-describedby={errors.email ? 'email-error' : undefined}
                placeholder="team@organization.ai"
                className={`w-full mt-2 rounded-3xl border px-4 py-3 bg-[#09101C] text-white outline-none transition ${
                  errors.email
                    ? 'border-red-500 focus:border-red-400'
                    : 'border-white/10 focus:border-cyan-400/40'
                }`}
              />
              {errors.email && (
                <span id="email-error" className="mt-1 text-sm text-red-400">
                  {errors.email}
                </span>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-300">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleInputChange}
                aria-invalid={!!errors.password}
                aria-describedby={errors.password ? 'password-error' : undefined}
                placeholder="Enter secure password"
                className={`w-full mt-2 rounded-3xl border px-4 py-3 bg-[#09101C] text-white outline-none transition ${
                  errors.password
                    ? 'border-red-500 focus:border-red-400'
                    : 'border-white/10 focus:border-cyan-400/40'
                }`}
              />
              {errors.password && (
                <span id="password-error" className="mt-1 text-sm text-red-400">
                  {errors.password}
                </span>
              )}
            </div>

            {isForgot && (
              <p className="rounded-3xl bg-white/5 p-4 text-sm text-slate-300">
                Enter your email and we will send a secure recovery link to regain access.
              </p>
            )}

            <motion.button
              type="submit"
              disabled={isLoading}
              whileHover={{ scale: !isLoading ? 1.01 : 1 }}
              whileTap={{ scale: !isLoading ? 0.97 : 1 }}
              className="w-full rounded-3xl bg-cyan-400 px-5 py-3 text-sm font-semibold text-slate-950 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading
                ? 'Loading...'
                : isSignUp
                ? 'Create Account'
                : isForgot
                ? 'Send Recovery Email'
                : 'Continue'}
            </motion.button>
          </form>

          <div className="mt-6 flex items-center justify-between gap-3 text-xs uppercase tracking-[0.28em] text-slate-500">
            <button
              type="button"
              onClick={() => onNavigate('forgot')}
              className="text-white/80 hover:text-white"
            >
              Forgot Password?
            </button>
            <span className="text-slate-600">or</span>
            <button
              type="button"
              onClick={() => onNavigate('home')}
              className="text-white/80 hover:text-white"
            >
              Back Home
            </button>
          </div>
        </div>
      </div>
    </motion.section>
  )
}
```

---

## 🟡 Fix #4: Add Accessibility Attributes

### Key Improvements:
```typescript
// Before
<button onClick={onClick} className="...">
  {label}
</button>

// After
<button
  onClick={onClick}
  aria-label={`Navigate to ${label}`}
  aria-current={page === key ? 'page' : undefined}
  className="..."
>
  {label}
</button>
```

---

## 🟡 Fix #5: File Upload Validation

```typescript
const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg', 'image/png', 'image/gif', 'image/webp',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain'
])

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

const validateFiles = (files: FileList): { valid: File[], errors: string[] } => {
  const valid: File[] = []
  const errors: string[] = []

  Array.from(files).forEach((file, index) => {
    if (!ALLOWED_MIME_TYPES.has(file.type)) {
      errors.push(`File ${index + 1}: Invalid file type (${file.type})`)
      return
    }

    if (file.size > MAX_FILE_SIZE) {
      errors.push(`File ${index + 1}: Too large (${(file.size / 1024 / 1024).toFixed(2)}MB)`)
      return
    }

    valid.push(file)
  })

  return { valid, errors }
}
```

---

## 🟡 Fix #6: Type Safety - Remove Implicit `any`

```typescript
// Before
onNavigate={(next) => { setPage('login'); setAuthPage(next) }}

// After
onNavigate={(next: 'login' | 'signup' | 'forgot') => {
  setPage('login')
  setAuthPage(next)
}}
```

---

## ✅ Testing Checklist

After applying fixes, test:
- [ ] Navigate between pages multiple times - no memory leak
- [ ] Network offline - Visme graceful fallback
- [ ] Form validation - all error messages display
- [ ] Form submission - API call works
- [ ] Screen reader - all interactive elements are announced
- [ ] Keyboard navigation - Tab through all controls
- [ ] Mobile responsive - layout works on small screens
- [ ] File upload - validates file types and size

