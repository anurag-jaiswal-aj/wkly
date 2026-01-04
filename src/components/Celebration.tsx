import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'

interface CelebrationProps {
  show: boolean
  message?: string
}

export default function Celebration({ show, message = 'Great job!' }: CelebrationProps) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (show) {
      setVisible(true)
      const timer = setTimeout(() => setVisible(false), 2000)
      return () => clearTimeout(timer)
    }
  }, [show])

  if (!visible) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.8 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -50, scale: 0.8 }}
      className="fixed bottom-8 right-8 z-50 px-6 py-4 bg-gray-900 dark:bg-gray-100 
                 text-white dark:text-black rounded-lg shadow-2xl"
    >
      <div className="flex items-center gap-3">
        <motion.span
          animate={{ rotate: [0, 15, -15, 15, 0] }}
          transition={{ duration: 0.5, repeat: 2 }}
          className="material-symbols-outlined text-2xl"
        >
          check_circle
        </motion.span>
        <span className="font-medium">{message}</span>
      </div>
    </motion.div>
  )
}
