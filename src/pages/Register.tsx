import { useState, FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/contexts/ToastContext'
import { motion } from 'framer-motion'

export default function Register() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const { signUp } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()

    if (password !== confirmPassword) {
      toast.showError('Passwords do not match')
      return
    }

    if (password.length < 6) {
      toast.showError('Password must be at least 6 characters')
      return
    }

    setLoading(true)

    const { error } = await signUp(email, password)

    if (error) {
      toast.showError(error.message)
      setLoading(false)
    } else {
      toast.showSuccess('Account created successfully!')
      navigate('/planner')
    }
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
          <h1 className="text-4xl font-light tracking-tight mb-2">Wkly</h1>
          <p className="text-gray-500">Create your account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
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

          <div>
            <label htmlFor="password" className="block text-sm font-medium mb-2">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-base"
              required
            />
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium mb-2">
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="input-base"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full"
          >
            {loading ? 'Creating account...' : 'Sign Up'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm">
          <span className="text-gray-500">Already have an account? </span>
          <Link
            to="/login"
            className="text-black dark:text-white hover:underline font-medium"
          >
            Sign in
          </Link>
        </div>
      </motion.div>
    </div>
  )
}
