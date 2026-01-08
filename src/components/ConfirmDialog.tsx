import { motion, AnimatePresence } from 'framer-motion'

interface ConfirmDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  confirmText?: string
  cancelText?: string
}

export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
}: ConfirmDialogProps) {
  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        onClick={onClose}
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        aria-describedby="confirm-dialog-message"
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-white dark:bg-gray-950 rounded-xl shadow-2xl max-w-md w-full p-6"
          onClick={(e) => e.stopPropagation()}
        >
          <h2 id="confirm-dialog-title" className="text-xl font-light mb-2">{title}</h2>
          <p id="confirm-dialog-message" className="text-sm text-gray-600 dark:text-gray-400 mb-6">
            {message}
          </p>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              aria-label="Cancel"
              className="flex-1 px-4 py-2 rounded border border-gray-300 dark:border-gray-700 
                       hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors text-sm"
            >
              {cancelText}
            </button>
            <button
              onClick={() => {
                onConfirm()
                onClose()
              }}
              aria-label={confirmText}
              className="flex-1 px-4 py-2 rounded bg-gray-900 dark:bg-gray-100 
                       text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 
                       transition-colors text-sm font-medium"
            >
              {confirmText}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
