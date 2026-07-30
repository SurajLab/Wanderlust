import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { login } from '../utils/api'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import logo from '../public/logo.png'
import loginBackground from '../public/login.png'
import API from '../utils/api'

const FEATURES = [
  { icon: 'fa-house-chimney', color: 'bg-red-100 text-primary', title: 'Discover Amazing Stays', sub: 'From cozy cabins to luxury villas' },
  { icon: 'fa-shield-halved', color: 'bg-violet-100 text-violet-600', title: 'Secure & Trusted', sub: 'Your safety and privacy are our priority' },
  { icon: 'fa-headset', color: 'bg-green-100 text-green-600', title: '24/7 Support', sub: "We're here to help anytime, anywhere" },
]

const AVATARS = [
  'https://i.pravatar.cc/40?img=1',
  'https://i.pravatar.cc/40?img=2',
  'https://i.pravatar.cc/40?img=3',
  'https://i.pravatar.cc/40?img=4',
]

export default function LoginPage() {
  const navigate = useNavigate()
  const { setUser } = useAuth()
  const { addToast } = useToast()
  const [form, setForm] = useState({ username: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [unverifiedEmail, setUnverifiedEmail] = useState(null)
  const [resendLoading, setResendLoading] = useState(false)
  const [resendSent, setResendSent] = useState(false)

  const handleChange = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }))

  const handleSubmit = async e => {
    e.preventDefault()
    setLoading(true)
    setUnverifiedEmail(null)
    setResendSent(false)
    try {
      const res = await login(form)
      setUser(res.data.user)
      addToast('Welcome back to WanderLust!')
      navigate('/listings')
    } catch (err) {
      const data = err.response?.data
      if (data?.requiresVerification) {
        setUnverifiedEmail(data.email)
      } else {
        addToast(data?.error || 'Invalid credentials', 'error')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    if (!unverifiedEmail) return
    setResendLoading(true)
    try {
      await API.post('/users/resend-verification', { email: unverifiedEmail })
      setResendSent(true)
      addToast('Verification email sent!')
    } catch (err) {
      addToast(err.response?.data?.error || 'Failed to send email', 'error')
    } finally {
      setResendLoading(false)
    }
  }

  return (
    <div className="min-h-screen relative flex items-center justify-center overflow-hidden">

      {/* Background image */}
      <div className="absolute inset-0 z-0">
        <img
          src={loginBackground}
          alt="bg"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-white/40 via-white/30 to-white/5" />
      </div>

      <div className="relative z-10 w-full max-w-6xl mx-auto px-6 py-10 flex flex-col lg:flex-row items-center gap-12">

        {/* ── LEFT — Text + Features ── */}
        <div className="flex-1 text-left">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-3 leading-tight">
            Welcome <span className="text-primary">Back</span>
          </h1>
          <p className="text-gray-600 text-base mb-8 max-w-sm">
            Sign in to your WanderLust account and continue exploring amazing properties worldwide.
          </p>

          {/* Features */}
          <div className="space-y-4 mb-10">
            {FEATURES.map((f, i) => (
              <div key={i} className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm ${f.color}`}>
                  <i className={`fa-solid ${f.icon} text-lg`} />
                </div>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">{f.title}</p>
                  <p className="text-xs text-gray-500">{f.sub}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Social proof */}
          <div className="flex items-center gap-3 bg-white/80 backdrop-blur rounded-2xl px-4 py-3 w-fit shadow-sm">
            <div className="flex -space-x-2">
              {AVATARS.map((src, i) => (
                <img key={i} src={src} alt="user" className="w-8 h-8 rounded-full border-2 border-white object-cover" />
              ))}
              <div className="w-8 h-8 rounded-full bg-primary border-2 border-white flex items-center justify-center">
                <span className="text-white text-[9px] font-bold">10K+</span>
              </div>
            </div>
            <p className="text-xs text-gray-600 font-medium">Join thousands of travelers trusting WanderLust</p>
          </div>
        </div>

        {/* ── RIGHT — Form Card ── */}
        <div className="w-full lg:w-[420px] flex-shrink-0">
          <div className="bg-white rounded-3xl shadow-2xl p-8">

            {/* Logo */}
            <div className="flex justify-center mb-6">
              <div className="relative">
                <img src={logo} alt="Wanderlust" className="h-20 w-20 object-contain" />
                <span className="absolute -top-1 -right-1 text-lg">✨</span>
                <span className="absolute -top-1 -left-2 text-sm">✦</span>
              </div>
            </div>

            {/* Unverified banner */}
            {unverifiedEmail && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-5">
                <div className="flex items-start gap-3">
                  <i className="fa-solid fa-triangle-exclamation text-amber-500 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-amber-800 mb-1">Email not verified</p>
                    <p className="text-xs text-amber-700 mb-3">
                      Please verify <span className="font-medium">{unverifiedEmail}</span> before logging in.
                    </p>
                    {resendSent ? (
                      <p className="text-xs text-green-700 font-medium">
                        <i className="fa-solid fa-circle-check mr-1" />Verification email sent!
                      </p>
                    ) : (
                      <button onClick={handleResend} disabled={resendLoading}
                        className="text-xs bg-amber-500 text-white px-3 py-1.5 rounded-lg font-semibold hover:bg-amber-600 disabled:opacity-60 transition-all">
                        {resendLoading ? 'Sending...' : 'Resend verification email'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">

              {/* Username */}
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-800 mb-1.5">
                  <i className="fa-solid fa-user text-primary text-xs" />
                  Username
                </label>
                <div className="relative">
                  <input
                    name="username"
                    value={form.username}
                    onChange={handleChange}
                    required
                    placeholder="Enter your username"
                    className="w-full px-4 py-3 pr-10 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition-all placeholder-gray-300 text-sm"
                  />
                  <i className="fa-regular fa-user absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 text-sm" />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-800 mb-1.5">
                  <i className="fa-solid fa-lock text-primary text-xs" />
                  Password
                </label>
                <div className="relative">
                  <input
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    value={form.password}
                    onChange={handleChange}
                    required
                    placeholder="Enter your password"
                    className="w-full px-4 py-3 pr-10 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition-all placeholder-gray-300 text-sm"
                  />
                  <button type="button" onClick={() => setShowPassword(p => !p)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500 transition-colors">
                    <i className={`fa-regular ${showPassword ? 'fa-eye' : 'fa-eye-slash'} text-sm`} />
                  </button>
                </div>
              </div>

              {/* Sign In button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary text-white font-bold py-3.5 rounded-xl hover:bg-red-500 disabled:opacity-60 transition-all flex items-center justify-center gap-2 shadow-md mt-2 text-sm"
              >
                <i className="fa-solid fa-arrow-right-to-bracket" />
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>

            {/* Divider */}
            <div className="relative my-5">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-100" />
              </div>
              <div className="relative flex justify-center">
                <span className="px-3 bg-white text-xs text-gray-400">New to WanderLust?</span>
              </div>
            </div>

            {/* Create Account */}
            <Link
              to="/signup"
              className="flex items-center justify-center gap-2 w-full py-3 border-2 border-primary text-primary font-bold rounded-xl hover:bg-primary/5 transition-all text-sm"
            >
              <i className="fa-solid fa-user-plus" />
              Create Account
            </Link>

            {/* Terms */}
            <p className="text-center text-xs text-gray-400 mt-4">
              By signing in, you agree to our{' '}
              <span className="text-primary font-semibold cursor-pointer hover:underline">Terms of Service</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}