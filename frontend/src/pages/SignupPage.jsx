import { useState } from 'react'
import { Link } from 'react-router-dom'
import { signup } from '../utils/api'
import { useToast } from '../context/ToastContext'
import logo from '../public/logo.png'

function getPasswordStrength(password) {
  const checks = {
    length: password.length >= 6,
    uppercase: /[A-Z]/.test(password),
    special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
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
      <div className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${passed ? 'bg-green-500' : 'bg-gray-200'}`}>
        {passed && (
          <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        )}
      </div>
      <span className={`text-xs transition-all ${passed ? 'text-green-600 line-through' : 'text-gray-500'}`}>{text}</span>
    </div>
  )
}

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
    weak:   { label: 'Weak',   color: 'bg-red-400',    width: 'w-1/4',  text: 'text-red-500' },
    medium: { label: 'Medium', color: 'bg-yellow-400', width: 'w-2/4',  text: 'text-yellow-600' },
    strong: { label: 'Strong', color: 'bg-green-500',  width: 'w-full', text: 'text-green-600' },
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
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-white to-blue-50/30 flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <img src={logo} alt="Wanderlust Logo" className="h-24 w-24 object-contain" />
            </div>
          </div>
          <div className="bg-white rounded-3xl shadow-lg p-8 border border-gray-100 text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <i className="fa-solid fa-envelope-circle-check text-blue-500 text-3xl" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Check your inbox!</h2>
            <p className="text-gray-600 mb-2">We sent a verification link to:</p>
            <p className="text-primary font-semibold mb-6">{submittedEmail}</p>
            <p className="text-gray-500 text-sm mb-8">
              Click the link in the email to activate your account. The link expires in 24 hours.
            </p>
            <p className="text-xs text-gray-400">
              Didn't receive it? Check your spam folder or{' '}
              <Link to="/login" className="text-primary font-semibold hover:underline">
                try logging in
              </Link>{' '}
              to trigger a resend prompt.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-white to-blue-50/30 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        {/* Header Section */}
        <div className="text-center mb-10">
          <div className="flex justify-center mb-4">
            <img src={logo} alt="Wanderlust Logo" className="h-32 w-32 object-contain" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Join WanderLust</h1>
          <p className="text-gray-600 text-base">Start your adventure and explore amazing properties worldwide</p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-3xl shadow-lg p-8 border border-gray-100">
          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Username Field */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <i className="fa-solid fa-user text-primary" />
                Username
              </label>
              <input
                name="username"
                value={form.username}
                onChange={handleChange}
                required
                placeholder="Choose your username"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all placeholder-gray-400"
              />
            </div>

            {/* Email Field */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <i className="fa-solid fa-envelope text-primary" />
                Email Address
              </label>
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                required
                placeholder="Enter your email"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all placeholder-gray-400"
              />
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <i className="fa-solid fa-lock text-primary" />
                Password
              </label>
              <div className="relative">
                <input
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={handleChange}
                  onFocus={() => setPasswordFocused(true)}
                  onBlur={() => setPasswordFocused(false)}
                  required
                  placeholder="Create a strong password"
                  className={`w-full px-4 py-3 pr-12 border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all placeholder-gray-400 ${
                    form.password && !isPasswordValid ? 'border-red-300' : 'border-gray-200'
                  }`}
                />
                {/* Show/hide toggle */}
                <button
                  type="button"
                  onClick={() => setShowPassword(p => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <i className={`fa-solid ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`} />
                </button>
              </div>

              {/* Strength bar + checklist — shown once user starts typing */}
              {form.password && (
                <div className="mt-3 space-y-2">
                  {/* Strength bar */}
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full transition-all duration-300 ${sc.color} ${sc.width}`} />
                    </div>
                    <span className={`text-xs font-semibold ${sc.text}`}>{sc.label}</span>
                  </div>
                  {/* Rules checklist */}
                  <div className="bg-gray-50 rounded-xl p-3 space-y-1.5">
                    <PasswordRule passed={checks.length}    text="At least 6 characters" />
                    <PasswordRule passed={checks.uppercase} text="At least 1 uppercase letter (A-Z)" />
                    <PasswordRule passed={checks.special}   text="At least 1 special character (!@#$...)" />
                    <PasswordRule passed={checks.number}    text="At least 1 number (bonus)" />
                  </div>
                </div>
              )}

              {/* Inline error after blur */}
              {form.password && !isPasswordValid && !passwordFocused && (
                <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                  <i className="fa-solid fa-circle-exclamation" />
                  Password doesn't meet the minimum requirements
                </p>
              )}
            </div>

            {/* Terms Checkbox */}
            <div className="flex items-start gap-2 pt-2">
              <input
                type="checkbox"
                id="terms"
                required
                className="mt-1 cursor-pointer"
              />
              <label htmlFor="terms" className="text-sm text-gray-600">
                I agree to the{' '}
                <span className="text-primary font-semibold cursor-pointer hover:underline">Terms of Service</span>
                {' '}and{' '}
                <span className="text-primary font-semibold cursor-pointer hover:underline">Privacy Policy</span>
              </label>
            </div>

            {/* Signup Button */}
            <button
              type="submit"
              disabled={loading || (form.password.length > 0 && !isPasswordValid)}
              className="w-full bg-gradient-to-r from-primary to-primary/80 text-white font-semibold py-3 rounded-xl hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all mt-6 flex items-center justify-center gap-2"
            >
              <i className="fa-solid fa-rocket" />
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-2 bg-white text-gray-500">Already exploring?</span>
            </div>
          </div>

          {/* Login Link */}
          <Link
            to="/login"
            className="block w-full text-center py-3 border-2 border-primary text-primary font-semibold rounded-xl hover:bg-primary/5 transition-all"
          >
            <i className="fa-solid fa-arrow-right-to-bracket mr-2" />
            Sign In
          </Link>
        </div>

        {/* Footer Text */}
        <p className="text-center text-xs text-gray-500 mt-6">
          Join thousands of travelers discovering amazing properties on WanderLust
        </p>
      </div>
    </div>
  )
}
