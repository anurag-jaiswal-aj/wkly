import { useState, FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/contexts/ToastContext'
import { motion } from 'framer-motion'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const { resetPasswordForEmail } = useAuth()
  const toast = useToast()

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    
    if (!email) {
      toast.showError('Please enter your email')
      return
    }

    setLoading(true)

    const { error } = await resetPasswordForEmail(email)

    if (error) {
      // Do not leak account existence if possible, but handle actual API errors
      toast.showError(error.message)
      setLoading(false)
    } else {
      setIsSuccess(true)
      setLoading(false)
    }
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-black px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md text-center"
        >
          <div className="mb-8">
            <h1 className="text-4xl font-light tracking-tight mb-2">Check your email</h1>
            <p className="text-gray-500 mt-4">
              If an account exists for <strong>{email}</strong>, we've sent a password reset link.
            </p>
          </div>
          <Link
            to="/login"
            className="btn-primary w-full inline-block"
          >
            Return to Login
          </Link>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-black px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <h1 className="text-4xl font-light tracking-tight mb-2">Reset Password</h1>
          <p className="text-gray-500">Enter your email to reset your password</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6" noValidate>
          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-2">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-base"
              required
              autoFocus
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full"
          >
            {loading ? 'Sending link...' : 'Send Reset Link'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm">
          <Link
            to="/login"
            className="text-gray-500 hover:text-black dark:hover:text-white hover:underline font-medium"
          >
            Back to login
          </Link>
        </div>
      </motion.div>
    </div>
  )
}
