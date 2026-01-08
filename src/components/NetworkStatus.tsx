import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export default function NetworkStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [showOffline, setShowOffline] = useState(false)

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true)
      setShowOffline(false)
    }

    const handleOffline = () => {
      setIsOnline(false)
      setShowOffline(true)
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  return (
    <AnimatePresence>
      {showOffline && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="fixed top-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2 bg-black dark:bg-white text-white dark:text-black border border-gray-700 dark:border-gray-300 shadow-lg flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-lg">
            wifi_off
          </span>
          <span className="text-sm">You are offline</span>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
