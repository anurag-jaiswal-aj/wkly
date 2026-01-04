import { motion, AnimatePresence } from 'framer-motion'

interface KeyboardShortcutsModalProps {
  isOpen: boolean
  onClose: () => void
}

const shortcuts = [
  { keys: ['Ctrl', 'N'], description: 'Create new task' },
  { keys: ['Ctrl', 'K'], description: 'Search tasks' },
  { keys: ['/'], description: 'Focus search' },
  { keys: ['Ctrl', 'F'], description: 'Toggle focus mode' },
  { keys: ['Ctrl', 'S'], description: 'Toggle weekly stats' },
  { keys: ['Ctrl', 'D'], description: 'Toggle dark/light mode' },
  { keys: ['Ctrl', '←'], description: 'Previous week' },
  { keys: ['Ctrl', '→'], description: 'Next week' },
  { keys: ['Ctrl', 'T'], description: 'Go to today' },
  { keys: ['Esc'], description: 'Close modal or focus mode' },
  { keys: ['?'], description: 'Show keyboard shortcuts' },
]

export default function KeyboardShortcutsModal({ isOpen, onClose }: KeyboardShortcutsModalProps) {
  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-white dark:bg-gray-950 rounded-xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
            <h2 className="text-xl font-light">Keyboard Shortcuts</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(80vh-80px)]">
            <div className="space-y-3">
              {shortcuts.map((shortcut, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between py-3 px-4 rounded-lg 
                           bg-gray-50 dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800 
                           transition-colors"
                >
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {shortcut.description}
                  </span>
                  <div className="flex items-center gap-1">
                    {shortcut.keys.map((key, i) => (
                      <span key={i}>
                        <kbd
                          className="px-2.5 py-1 text-xs font-medium bg-white dark:bg-gray-950 
                                   border border-gray-300 dark:border-gray-700 rounded 
                                   shadow-sm text-gray-900 dark:text-gray-100"
                        >
                          {key}
                        </kbd>
                        {i < shortcut.keys.length - 1 && (
                          <span className="mx-1 text-gray-400">+</span>
                        )}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-800">
              <p className="text-xs text-gray-500 text-center">
                Tip: Use <kbd className="px-1.5 py-0.5 text-xs bg-gray-100 dark:bg-gray-900 rounded">Ctrl</kbd> on Windows/Linux 
                or <kbd className="px-1.5 py-0.5 text-xs bg-gray-100 dark:bg-gray-900 rounded">Cmd</kbd> on Mac
              </p>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
