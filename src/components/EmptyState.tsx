import { motion } from 'framer-motion'

interface EmptyStateProps {
  icon: string
  title: string
  description: string
  action?: {
    label: string
    onClick: () => void
  }
}

export default function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-6 px-4 text-center"
    >
      <div className="mb-3 text-gray-300 dark:text-gray-700">
        <span className="material-symbols-outlined" style={{ fontSize: '64px' }} aria-hidden="true">
          {icon}
        </span>
      </div>
      
      <h3 className="text-lg font-light mb-1 text-gray-900 dark:text-gray-100">
        {title}
      </h3>
      
      <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm mb-0">
        {description}
      </p>
      
      {action && (
        <button
          onClick={action.onClick}
          className="btn-primary"
        >
          {action.label}
        </button>
      )}
    </motion.div>
  )
}
