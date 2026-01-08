import { motion } from 'framer-motion'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  fullScreen?: boolean
}

export default function LoadingSpinner({ size = 'md', fullScreen = false }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-2',
    lg: 'w-12 h-12 border-3'
  }

  const spinner = (
    <motion.div
      className={`${sizeClasses[size]} border-gray-300 dark:border-gray-700 border-t-gray-900 dark:border-t-gray-100 rounded-full`}
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
    />
  )

  if (fullScreen) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          {spinner}
          <p className="mt-4 text-sm text-gray-500">Loading...</p>
        </div>
      </div>
    )
  }

  return spinner
}
