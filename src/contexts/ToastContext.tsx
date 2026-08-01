/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useCallback, ReactNode } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

type ToastType = 'success' | 'error' | 'info' | 'warning'

interface Toast {
  id: string
  message: string
  type: ToastType
  duration?: number
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType, duration?: number) => void
  showSuccess: (message: string) => void
  showError: (message: string) => void
  showInfo: (message: string) => void
  showWarning: (message: string) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }, [])

  const showToast = useCallback((message: string, type: ToastType = 'info', duration = 5000) => {
    const id = Math.random().toString(36).substring(7)
    const toast: Toast = { id, message, type, duration }
    
    setToasts((prev) => [...prev, toast])

    if (duration > 0) {
      setTimeout(() => removeToast(id), duration)
    }
  }, [removeToast])

  const showSuccess = useCallback((message: string) => showToast(message, 'success'), [showToast])
  const showError = useCallback((message: string) => showToast(message, 'error', 7000), [showToast])
  const showInfo = useCallback((message: string) => showToast(message, 'info'), [showToast])
  const showWarning = useCallback((message: string) => showToast(message, 'warning'), [showToast])

  const getToastStyles = () => {
    // All toasts use monochrome theme - black/white only
    return 'bg-black dark:bg-white text-white dark:text-black border border-gray-700 dark:border-gray-300'
  }

  const getIcon = (type: ToastType) => {
    switch (type) {
      case 'success':
        return 'check_circle'
      case 'error':
        return 'error'
      case 'warning':
        return 'warning'
      default:
        return 'info'
    }
  }

  return (
    <ToastContext.Provider value={{ showToast, showSuccess, showError, showInfo, showWarning }}>
      {children}
      
      {/* Toast Container */}
      <div className="fixed bottom-8 right-8 z-50 flex flex-col gap-2 max-w-md" role="region" aria-label="Notifications" aria-live="polite">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 50, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.8 }}
              role="alert"
              aria-live={toast.type === 'error' ? 'assertive' : 'polite'}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg shadow-2xl ${getToastStyles()}`}
            >
              <span className="material-symbols-outlined text-xl flex-shrink-0" aria-hidden="true">
                {getIcon(toast.type)}
              </span>
              <span className="text-sm font-medium flex-1">{toast.message}</span>
              <button
                onClick={() => removeToast(toast.id)}
                aria-label="Dismiss notification"
                className="flex-shrink-0 opacity-70 hover:opacity-100 transition-opacity"
              >
                <span className="material-symbols-outlined text-lg" aria-hidden="true">close</span>
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within ToastProvider')
  }
  return context
}
