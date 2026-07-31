import { useState } from 'react'
import { Link } from 'react-router-dom'
import { signup } from '../utils/api'
import { useToast } from '../context/ToastContext'
import logo from '../public/logo.png'
import signupBackground from '../public/signup.png'

function getPasswordStrength(password) {
  const checks = {
    length: password.length >= 6,
    uppercase: /[A-Z]/.test(password),
    special: /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>\/?]/.test(password),
    number: /[0-9]/.test(password),
  }
  const passed = Object.values(checks).filter(Boolean).length
  let strength = 'weak'
  if (passed === 4) strength = 'strong'
  else if (passed === 3) strength = 'medium'
  return { checks, strength }
}

function PasswordRule({ passed, text }) {
  return (
    <div className="flex items-center gap-2">
      <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${passed ? 'bg-green-500' : 'bg-gray-200'}`}>
        {passed && (
          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        )}
      </div>
      <span className={`text-xs transition-all ${passed ? 'text-green-600' : 'text-gray-500'}`}>{text}</span>
    </div>
  )
}

const FEATURES = [
  { icon: 'fa-house-chimney', color: 'bg-red-100 text-primary', title: 'Discover unique stays', sub: 'From cozy cabins to luxury villas' },
  { icon: 'fa-shield-halved', color: 'bg-violet-100 text-violet-600', title: 'Secure & trusted', sub: 'Your safety and privacy are our priority' },
  { icon: 'fa-headset', color: 'bg-green-100 text-green-600', title: '24/7 customer support', sub: "We're here to help anytime, anywhere" },
]

const AVATARS = [
  'https://i.pravatar.cc/40?img=11',
  'https://i.pravatar.cc/40?img=12',
  'https://i.pravatar.cc/40?img=13',
  'https://i.pravatar.cc/40?img=14',
]

export default function SignupPage() {
  const { addToast } = useToast()
  const [form, setForm] = useState({ username: '', email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [submittedEmail, setSubmittedEmail] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [passwordFocused, setPasswordFocused] = useState(false)

  const { checks, strength } = getPasswordStrength(form.password)
  const isPasswordValid = checks.length && checks.uppercase && checks.special

  const strengthConfig = {
    weak: { label: 'Weak', color: 'bg-red-400', width: 'w-1/4', text: 'text-red-500' },
    medium: { label: 'Medium', color: 'bg-yellow-400', width: 'w-2/4', text: 'text-yellow-600' },
    strong: { label: 'Strong', color: 'bg-green-500', width: 'w-full', text: 'text-green-600' },
  }
  const sc = strengthConfig[strength]

  const handleChange = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }))

  const handleSubmit = async e => {
    e.preventDefault()
    if (!isPasswordValid) {
      addToast('Please set a stronger password before continuing.', 'error')
      return
    }
    setLoading(true)
    try {
      await signup(form)
      setSubmittedEmail(form.email)
      setDone(true)
    } catch (e) {
      addToast(e.response?.data?.error || 'Signup failed', 'error')
    } finally {
      setLoading(false)
    }
  }

  if (done) {
    return (
      <div className="min-h-screen flex">
        <div className="w-full flex md:w-1/2 relative flex-col justify-center px-6 md:px-12 py-10">
          <img src={signupBackground} alt="bg" className="absolute inset-0 w-full h-full object-cover" />
          <div className="relative z-10 text-center">
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <i className="fa-solid fa-envelope-circle-check text-blue-500 text-4xl" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-2">Check your inbox!</h2>
            <p className="text-white/80 text-sm">We sent a verification link to your email.</p>
          </div>
        </div>
        <div className="w-full lg:w-1/2 flex items-center justify-center px-10 py-10" style={{ background: 'linear-gradient(135deg, #fce4ec 0%, #f3e5f5 40%, #ede7f6 70%, #e8eaf6 100%)' }}>
          <div className="w-full max-w-sm bg-white rounded-3xl shadow-2xl p-8 text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-5">
              <i className="fa-solid fa-envelope-circle-check text-blue-500 text-3xl" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Check your inbox!</h2>
            <p className="text-gray-500 text-sm mb-2">We sent a verification link to:</p>
            <p className="text-primary font-semibold mb-5">{submittedEmail}</p>
            <p className="text-gray-500 text-xs mb-6">Click the link to activate your account. Expires in 24 hours.</p>
            <p className="text-xs text-gray-400">
              Didn't receive it?{' '}
              <Link to="/login" className="text-primary font-semibold hover:underline">Try logging in</Link>
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
      <div className="min-h-screen relative overflow-hidden">
      <img src={signupBackground} alt="background" className="absolute inset-0 w-full h-full object-cover" />
      <div className="relative z-10 min-h-screen flex flex-col md:flex-row">
        <div className="w-full flex md:w-1/2 relative flex-col justify-center px-6 md:px-12 py-10">
            <div className="relative z-10 max-w-lg px-6 md:pl-12 lg:pl-24">
            <h1 className="text-4xl md:text-5xl font-bold mb-3 leading-tight">
              <span className="text-slate-900">Join</span>{' '}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-pink-400 to-violet-400">Wanderlust</span>
            </h1>
            <p className="text-slate-700 text-base mb-10 max-w-sm leading-relaxed">
              Start your adventure and explore amazing properties worldwide.
            </p>
            <div className="space-y-6 mb-10 mt-6">
              {FEATURES.map((f, i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm bg-white/90 ${f.color.split(' ')[1]}`}>
                    <i className={`fa-solid ${f.icon} text-lg`} />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900 text-sm">{f.title}</p>
                    <p className="text-slate-500 text-xs">{f.sub}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-3 bg-white/90 backdrop-blur rounded-2xl px-4 py-3 w-fit shadow-md">
              <div className="flex -space-x-2">
                {AVATARS.map((src, i) => (
                  <img key={i} src={src} alt="user" className="w-8 h-8 rounded-full border-2 border-white object-cover" />
                ))}
                <div className="w-8 h-8 rounded-full bg-primary border-2 border-white flex items-center justify-center">
                  <span className="text-white text-[9px] font-bold">10K+</span>
                </div>
              </div>
              <p className="text-xs text-gray-700 font-medium">Join thousands of travelers finding their perfect stay</p>
            </div>
          </div>
        </div>

        <div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-8 relative bg-transparent">
          <div className="w-full max-w-md relative z-10">
            <div className="bg-white rounded-3xl shadow-2xl p-8 border border-red-50">
              <div className="flex justify-center mb-5">
                <div className="relative">
                  <img src={logo} alt="Wanderlust" className="h-16 w-16 object-contain" />
                  <span className="absolute -top-1 -right-2 text-base">✨</span>
                  <span className="absolute -top-2 -left-3 text-sm text-violet-400">✦</span>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-800 mb-1.5">
                    <i className="fa-solid fa-user text-primary text-xs" />
                    Username
                  </label>
                  <div className="relative">
                    <input name="username" value={form.username} onChange={handleChange} required
                      placeholder="Choose your username"
                        className={`w-full px-4 py-3 pr-10 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition-all placeholder-gray-300 text-sm ${form.email ? 'bg-blue-50' : 'bg-gray-50'}`} />
                    {form.username && <i className="fa-solid fa-circle-check absolute right-3 top-1/2 -translate-y-1/2 text-green-500 text-sm" />}
                  </div>
                </div>

                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-800 mb-1.5">
                    <i className="fa-solid fa-envelope text-primary text-xs" />
                    Email Address
                  </label>
                  <div className="relative">
                    <input name="email" type="email" value={form.email} onChange={handleChange} required
                      placeholder="Enter your email"
                      className="w-full px-4 py-3 pr-10 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition-all placeholder-gray-300 text-sm bg-gray-50" />
                    {form.email && form.email.includes('@') && <i className="fa-solid fa-circle-check absolute right-3 top-1/2 -translate-y-1/2 text-green-500 text-sm" />}
                  </div>
                </div>

                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-800 mb-1.5">
                    <i className="fa-solid fa-lock text-primary text-xs" />
                    Password
                  </label>
                  <div className="relative">
                    <input name="password" type={showPassword ? 'text' : 'password'} value={form.password}
                      onChange={handleChange} onFocus={() => setPasswordFocused(true)} onBlur={() => setPasswordFocused(false)}
                      required placeholder="Create a strong password"
                      className={`w-full px-4 py-3 pr-12 border rounded-xl focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition-all placeholder-gray-300 text-sm bg-gray-50 ${form.password && !isPasswordValid ? 'border-red-300' : 'border-gray-200'}`} />
                    <button type="button" onClick={() => setShowPassword(p => !p)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500 transition-colors">
                      <i className={`fa-regular ${showPassword ? 'fa-eye' : 'fa-eye-slash'} text-sm`} />
                    </button>
                  </div>
                  {form.password && (
                    <div className="mt-2 space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full transition-all duration-300 ${sc.color} ${sc.width}`} />
                        </div>
                        <span className={`text-xs font-semibold ${sc.text}`}>{sc.label}</span>
                      </div>
                      <div className="bg-gray-50 rounded-xl p-3 space-y-1.5">
                        <PasswordRule passed={checks.length} text="At least 6 characters" />
                        <PasswordRule passed={checks.uppercase} text="At least 1 uppercase letter (A–Z)" />
                        <PasswordRule passed={checks.special} text="At least 1 special character (!@#$%^&*)" />
                        <PasswordRule passed={checks.number} text="At least 1 number (0–9)" />
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex items-start gap-2 pt-1">
                  <input type="checkbox" id="terms" required className="mt-1 cursor-pointer accent-primary" />
                  <label htmlFor="terms" className="text-xs text-gray-600">
                    I agree to the{' '}
                    <span className="text-primary font-semibold cursor-pointer hover:underline">Terms of Service</span>
                    {' '}and{' '}
                    <span className="text-primary font-semibold cursor-pointer hover:underline">Privacy Policy</span>
                  </label>
                </div>

                <button type="submit"
                  disabled={loading || (form.password.length > 0 && !isPasswordValid)}
                  className="w-full text-white font-bold py-3.5 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 shadow-md text-sm mt-2 bg-gradient-to-r from-red-400 to-red-500 hover:from-red-500 hover:to-red-600">
                  <i className="fa-solid fa-rocket" />
                  {loading ? 'Creating account...' : 'Create Account'}
                </button>
              </form>

              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-100" /></div>
                <div className="relative flex justify-center">
                  <span className="px-3 bg-white text-xs text-gray-400">Already exploring?</span>
                </div>
              </div>

              <Link to="/login"
                className="flex items-center justify-center gap-2 w-full py-3 border-2 border-red-200 text-red-500 font-bold rounded-xl hover:bg-red-50 transition-all text-sm">
                <i className="fa-solid fa-arrow-right-to-bracket" />
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
