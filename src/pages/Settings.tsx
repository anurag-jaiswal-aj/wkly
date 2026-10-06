import { useState, FormEvent } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/contexts/ToastContext'
import { supabase } from '@/lib/supabase'
import ConfirmDialog from '@/components/ConfirmDialog'
import { useNavigate } from 'react-router-dom'

export default function Settings() {
  const { user, updatePassword, signOut } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()

  // Email state
  const [newEmail, setNewEmail] = useState('')
  const [emailLoading, setEmailLoading] = useState(false)

  // Password state
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordLoading, setPasswordLoading] = useState(false)
  // Delete state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)

  const handleEmailUpdate = async (e: FormEvent) => {
    e.preventDefault()

    if (!newEmail || newEmail === user?.email) {
      toast.showError('Please enter a new email address.')
      return
    }

    setEmailLoading(true)

    // Using Supabase client directly for email update as it's not in useAuth yet
    const { error } = await supabase.auth.updateUser({ email: newEmail })

    if (error) {
      toast.showError(error.message)
    } else {
      toast.showSuccess('Check your new email address to confirm the change.')
      setNewEmail('')
    }
    
    setEmailLoading(false)
  }

  const handlePasswordUpdate = async (e: FormEvent) => {
    e.preventDefault()

    if (newPassword !== confirmPassword) {
      toast.showError('Passwords do not match')
      return
    }

    if (newPassword.length < 6) {
      toast.showError('Password must be at least 6 characters')
      return
    }

    setPasswordLoading(true)

    const { error } = await updatePassword(newPassword)

    if (error) {
      toast.showError(error.message)
    } else {
      toast.showSuccess('Password updated successfully!')
      setNewPassword('')
      setConfirmPassword('')
    }

    setPasswordLoading(false)
  }

  const handleDeleteAccount = async () => {
    setDeleteLoading(true)
    try {
      // Get current session token for authorization
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        toast.showError('You must be logged in to delete your account.')
        setDeleteLoading(false)
        setShowDeleteConfirm(false)
        return
      }

      // Invoke the Edge Function
      const { error } = await supabase.functions.invoke('delete-account', {
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      })

      if (error) {
        throw error
      }

      toast.showSuccess('Account successfully deleted.')
      
      // Successfully deleted, now sign out locally
      await signOut()
      setShowDeleteConfirm(false)
      navigate('/login', { replace: true })
    } catch (error) {
      console.error('Delete account error:', error)
      toast.showError('Failed to delete account. Please try again.')
    } finally {
      setDeleteLoading(false)
    }
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-2xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <h1 className="text-3xl font-light tracking-tight text-gray-900 dark:text-white mb-8">
            Account Settings
          </h1>

          <div className="space-y-10">
            {/* Email Section */}
            <section className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-800">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Email Address</h2>
              
              <div className="mb-6">
                <p className="text-sm text-gray-500 mb-1">Current Email</p>
                <p className="text-md font-medium text-gray-900 dark:text-gray-100">
                  {user?.email}
                </p>
              </div>

              <form onSubmit={handleEmailUpdate} className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    New Email Address
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    className="input-base"
                    placeholder="Enter new email"
                    required
                  />
                </div>
                
                <button
                  type="submit"
                  disabled={emailLoading}
                  className="btn-primary"
                >
                  {emailLoading ? 'Updating...' : 'Update Email'}
                </button>
              </form>
            </section>

            {/* Password Section */}
            <section className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-800">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Change Password</h2>
              
              <form onSubmit={handlePasswordUpdate} className="space-y-4">
                <div>
                  <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    New Password
                  </label>
                  <input
                    id="newPassword"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="input-base"
                    placeholder="New password"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Confirm New Password
                  </label>
                  <input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="input-base"
                    placeholder="Confirm new password"
                    required
                  />
                </div>
                
                <button
                  type="submit"
                  disabled={passwordLoading}
                  className="btn-primary"
                >
                  {passwordLoading ? 'Updating...' : 'Update Password'}
                </button>
              </form>
            </section>

            {/* Danger Zone */}
            <section className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-sm border border-red-100 dark:border-red-900/30">
              <h2 className="text-lg font-medium text-red-600 dark:text-red-400 mb-2">Danger Zone</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                Permanently delete your account and all associated data. This action cannot be undone.
              </p>
              
              <button
                type="button"
                disabled={deleteLoading}
                className="px-4 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/40 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={() => setShowDeleteConfirm(true)}
              >
                {deleteLoading ? 'Processing...' : 'Delete Account'}
              </button>
            </section>
          </div>
        </motion.div>
      </div>
      
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => {
          if (!deleteLoading) setShowDeleteConfirm(false)
        }}
        onConfirm={handleDeleteAccount}
        title="Delete Account"
        message="Are you sure you want to permanently delete your account? All your tasks, subtasks, and tags will be deleted immediately. This action cannot be undone."
        confirmText="Delete my account"
        cancelText="Cancel"
        isLoading={deleteLoading}
      />
    </div>
  )
}
