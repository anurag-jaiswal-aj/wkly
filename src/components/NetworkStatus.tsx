import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export default function NetworkStatus() {
  const [showOffline, setShowOffline] = useState(!navigator.onLine)

  useEffect(() => {
    const handleOnline = () => setShowOffline(false)
    const handleOffline = () => setShowOffline(true)

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
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className="fixed top-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2 bg-black dark:bg-white text-white dark:text-black border border-white dark:border-black shadow-lg flex items-center gap-2"
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
