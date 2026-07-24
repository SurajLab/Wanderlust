import { useEffect, useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { useToast } from '../context/ToastContext'
import logo from '../public/logo.png'
import API from '../utils/api'

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams()
  const { addToast } = useToast()
  const [status, setStatus] = useState('loading') // loading | success | error
  const [message, setMessage] = useState('')
  const [resendEmail, setResendEmail] = useState('')
  const [resendLoading, setResendLoading] = useState(false)
  const [resendSent, setResendSent] = useState(false)

  useEffect(() => {
    const token = searchParams.get('token')
    if (!token) {
      setStatus('error')
      setMessage('No verification token found in the link.')
      return
    }

    API.get(`/users/verify-email?token=${token}`)
      .then(res => {
        setStatus('success')
        setMessage(res.data.message)
      })
      .catch(err => {
        setStatus('error')
        setMessage(err.response?.data?.error || 'Verification failed. The link may have expired.')
      })
  }, [searchParams])

  const handleResend = async (e) => {
    e.preventDefault()
    if (!resendEmail) return
    setResendLoading(true)
    try {
      await API.post('/users/resend-verification', { email: resendEmail })
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
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <img src={logo} alt="Wanderlust Logo" className="h-24 w-24 object-contain" />
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-lg p-8 border border-gray-100 text-center">
          {status === 'loading' && (
            <>
              <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-6" />
              <h2 className="text-xl font-bold text-gray-900 mb-2">Verifying your email...</h2>
              <p className="text-gray-500 text-sm">Please wait a moment.</p>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <i className="fa-solid fa-circle-check text-green-500 text-3xl" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Email Verified!</h2>
              <p className="text-gray-600 mb-8">{message}</p>
              <Link
                to="/login"
                className="block w-full bg-gradient-to-r from-primary to-primary/80 text-white font-semibold py-3 rounded-xl hover:shadow-lg transition-all"
              >
                <i className="fa-solid fa-arrow-right-to-bracket mr-2" />
                Go to Login
              </Link>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <i className="fa-solid fa-circle-xmark text-red-500 text-3xl" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Verification Failed</h2>
              <p className="text-gray-600 mb-8">{message}</p>

              {!resendSent ? (
                <form onSubmit={handleResend} className="text-left space-y-4">
                  <p className="text-sm font-semibold text-gray-700 text-center mb-2">Resend a new verification link:</p>
                  <input
                    type="email"
                    value={resendEmail}
                    onChange={e => setResendEmail(e.target.value)}
                    placeholder="Enter your email address"
                    required
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all placeholder-gray-400"
                  />
                  <button
                    type="submit"
                    disabled={resendLoading}
                    className="w-full bg-gradient-to-r from-primary to-primary/80 text-white font-semibold py-3 rounded-xl hover:shadow-lg disabled:opacity-60 transition-all"
                  >
                    {resendLoading ? 'Sending...' : 'Resend Verification Email'}
                  </button>
                </form>
              ) : (
                <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-green-700 text-sm">
                  <i className="fa-solid fa-envelope mr-2" />
                  A new verification link has been sent. Please check your inbox.
                </div>
              )}

              <Link to="/signup" className="block text-center mt-4 text-primary text-sm font-semibold hover:underline">
                Back to Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
