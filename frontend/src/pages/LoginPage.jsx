import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { login } from '../utils/api'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import logo from '../public/logo.png'
import API from '../utils/api'

export default function LoginPage() {
  const navigate = useNavigate()
  const { setUser } = useAuth()
  const { addToast } = useToast()
  const [form, setForm] = useState({ username: '', password: '' })
  const [loading, setLoading] = useState(false)
  // For unverified user resend flow
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
        // Server told us the email isn't verified
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
      addToast('Verification email sent!', 'success')
    } catch (err) {
      addToast(err.response?.data?.error || 'Failed to send email', 'error')
    } finally {
      setResendLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-white to-blue-50/30 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        {/* Header Section */}
        <div className="text-center mb-10">
          <div className="flex justify-center mb-4">
            <img src={logo} alt="Wanderlust Logo" className="h-32 w-32 object-contain" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h1>
          <p className="text-gray-600 text-base">Sign in to your WanderLust account and continue exploring</p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-3xl shadow-lg p-8 border border-gray-100">

          {/* Unverified email banner */}
          {unverifiedEmail && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
              <div className="flex items-start gap-3">
                <i className="fa-solid fa-triangle-exclamation text-amber-500 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-amber-800 mb-1">Email not verified</p>
                  <p className="text-xs text-amber-700 mb-3">
                    Please verify your email (<span className="font-medium">{unverifiedEmail}</span>) before logging in.
                  </p>
                  {resendSent ? (
                    <p className="text-xs text-green-700 font-medium">
                      <i className="fa-solid fa-circle-check mr-1" />
                      Verification email sent! Check your inbox.
                    </p>
                  ) : (
                    <button
                      onClick={handleResend}
                      disabled={resendLoading}
                      className="text-xs bg-amber-500 text-white px-3 py-1.5 rounded-lg font-semibold hover:bg-amber-600 disabled:opacity-60 transition-all"
                    >
                      {resendLoading ? 'Sending...' : 'Resend verification email'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

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
                placeholder="Enter your username"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all placeholder-gray-400"
              />
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <i className="fa-solid fa-lock text-primary" />
                Password
              </label>
              <input
                name="password"
                type="password"
                value={form.password}
                onChange={handleChange}
                required
                placeholder="Enter your password"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all placeholder-gray-400"
              />
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-primary to-primary/80 text-white font-semibold py-3 rounded-xl hover:shadow-lg disabled:opacity-60 transition-all mt-6 flex items-center justify-center gap-2"
            >
              <i className="fa-solid fa-arrow-right-to-bracket" />
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-2 bg-white text-gray-500">New to WanderLust?</span>
            </div>
          </div>

          {/* Signup Link */}
          <Link
            to="/signup"
            className="block w-full text-center py-3 border-2 border-primary text-primary font-semibold rounded-xl hover:bg-primary/5 transition-all"
          >
            <i className="fa-solid fa-user-plus mr-2" />
            Create Account
          </Link>
        </div>

        {/* Footer Text */}
        <p className="text-center text-xs text-gray-500 mt-6">
          By signing in, you agree to our{' '}
          <span className="text-primary font-semibold cursor-pointer hover:underline">Terms of Service</span>
        </p>
      </div>
    </div>
  )
}
