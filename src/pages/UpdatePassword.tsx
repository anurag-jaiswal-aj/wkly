import { useState, FormEvent, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/contexts/ToastContext'
import { motion } from 'framer-motion'
import LoadingSpinner from '@/components/LoadingSpinner'

export default function UpdatePassword() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loadingLocal, setLoadingLocal] = useState(false)
  
  const { user, loading: authLoading, error: authError, isPasswordRecovery, updatePassword } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()

  useEffect(() => {
    // If not loading, no user, and no specific auth error, redirect to login.
    // They are not in a valid session or recovery flow.
    // We also check window.location.hash to ensure we don't redirect away from the error UI.
    const hasHashError = window.location.hash.includes('error=')
    if (!authLoading && !user && !authError && !hasHashError) {
      navigate('/login', { replace: true })
    }
  }, [authLoading, user, authError, navigate])

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

    setLoadingLocal(true)

    const { error } = await updatePassword(password)

    if (error) {
      toast.showError(error.message)
      setLoadingLocal(false)
    } else {
      toast.showSuccess('Password updated successfully!')
      setLoadingLocal(false)
      // Clear password fields (good practice)
      setPassword('')
      setConfirmPassword('')
      // Navigate into the app
      navigate('/planner', { replace: true })
    }
  }

  if (authLoading) {
    return <LoadingSpinner fullScreen />
  }

  // Handle expired/invalid link gracefully (Supabase throws an error during getSession if hash is invalid)
  if (authError || (!user && window.location.hash.includes('error='))) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-black px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md text-center"
        >
          <div className="mb-8">
            <span className="material-symbols-outlined text-5xl text-red-500 mb-4 inline-block">error</span>
            <h1 className="text-3xl font-light tracking-tight mb-2">Invalid Link</h1>
            <p className="text-gray-500 mt-4">
              This password reset link is invalid or has expired. Please request a new one.
            </p>
          </div>
          <div className="space-y-4">
            <Link to="/forgot-password" className="btn-primary w-full inline-block">
              Request New Link
            </Link>
            <Link to="/login" className="text-gray-500 hover:text-black dark:hover:text-white hover:underline block text-sm">
              Back to Login
            </Link>
          </div>
        </motion.div>
      </div>
    )
  }

  // If somehow reached here without user and no error, render nothing while effect redirects
  if (!user) return null

  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-black px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <h1 className="text-4xl font-light tracking-tight mb-2">
            {isPasswordRecovery ? 'Set New Password' : 'Update Password'}
          </h1>
          <p className="text-gray-500">
            {isPasswordRecovery 
              ? 'Please enter your new password below.' 
              : 'Enter a new password for your account.'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="password" className="block text-sm font-medium mb-2">
              New Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-base"
              required
              autoFocus
            />
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium mb-2">
              Confirm New Password
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
            disabled={loadingLocal}
            className="btn-primary w-full"
          >
            {loadingLocal ? 'Updating...' : 'Update Password'}
          </button>
        </form>
        
        {/* If this was not a recovery flow but a manual update, provide a way back */}
        {!isPasswordRecovery && (
          <div className="mt-6 text-center text-sm">
            <Link
              to="/planner"
              className="text-gray-500 hover:text-black dark:hover:text-white hover:underline font-medium"
            >
              Cancel and return to planner
            </Link>
          </div>
        )}
      </motion.div>
    </div>
  )
}
