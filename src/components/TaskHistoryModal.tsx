import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { formatDistanceToNow } from 'date-fns'

interface TaskHistoryEntry {
  id: string
  task_id: string
  action: 'created' | 'updated' | 'completed' | 'uncompleted' | 'deleted'
  field_changed?: string
  old_value?: unknown
  new_value?: unknown
  created_at: string
  user_id: string
}

interface TaskHistoryModalProps {
  isOpen: boolean
  onClose: () => void
  taskId: string
  taskTitle: string
}

export default function TaskHistoryModal({
  isOpen,
  onClose,
  taskId,
  taskTitle,
}: TaskHistoryModalProps) {
  const [history, setHistory] = useState<TaskHistoryEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!(isOpen && taskId)) return

    let mounted = true
    ;(async () => {
      setLoading(true)

      // Mock data for demo
      const mockHistory: TaskHistoryEntry[] = [
        {
          id: '1',
          task_id: taskId,
          action: 'completed',
          created_at: new Date().toISOString(),
          user_id: 'user1',
        },
        {
          id: '2',
          task_id: taskId,
          action: 'updated',
          field_changed: 'priority',
          old_value: 'low',
          new_value: 'high',
          created_at: new Date(Date.now() - 3600000).toISOString(),
          user_id: 'user1',
        },
        {
          id: '3',
          task_id: taskId,
          action: 'created',
          created_at: new Date(Date.now() - 7200000).toISOString(),
          user_id: 'user1',
        },
      ]

      if (mounted) setHistory(mockHistory)
      if (mounted) setLoading(false)
    })()

    return () => { mounted = false }
  }, [isOpen, taskId])

  const getActionIcon = (action: TaskHistoryEntry['action']) => {
    switch (action) {
      case 'created':
        return 'add_circle'
      case 'updated':
        return 'edit'
      case 'completed':
        return 'check_circle'
      case 'uncompleted':
        return 'radio_button_unchecked'
      case 'deleted':
        return 'delete'
      default:
        return 'history'
    }
  }

  const getActionText = (entry: TaskHistoryEntry) => {
    if (entry.action === 'updated' && entry.field_changed) {
      return `Changed ${entry.field_changed} from "${entry.old_value}" to "${entry.new_value}"`
    }
    return entry.action.charAt(0).toUpperCase() + entry.action.slice(1)
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 
                       md:w-full md:max-w-2xl bg-white dark:bg-black rounded-lg shadow-2xl z-50 
                       flex flex-col max-h-[90vh] border border-gray-200 dark:border-gray-800"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-800">
              <div>
                <h2 className="text-xl font-light">Task History</h2>
                <p className="text-sm text-gray-500 mt-1">{taskTitle}</p>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-900 rounded-lg transition-colors"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {/* History Timeline */}
            <div className="flex-1 overflow-y-auto p-6">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black dark:border-white"></div>
                </div>
              ) : history.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <span className="material-symbols-outlined text-4xl mb-2 opacity-50">history</span>
                  <p>No history available</p>
                </div>
              ) : (
                <div className="relative">
                  {/* Timeline line */}
                  <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-800" />

                  <div className="space-y-6">
                    {history.map((entry, index) => (
                      <motion.div
                        key={entry.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="relative flex gap-4"
                      >
                        {/* Timeline dot */}
                        <div className="flex-shrink-0 w-12 h-12 rounded-full bg-white dark:bg-black 
                                      border-2 border-gray-200 dark:border-gray-800 
                                      flex items-center justify-center z-10">
                          <span className="material-symbols-outlined text-xl text-gray-600 dark:text-gray-400">
                            {getActionIcon(entry.action)}
                          </span>
                        </div>

                        {/* Content */}
                        <div className="flex-1 pb-6">
                          <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 border border-gray-200 dark:border-gray-800">
                            <p className="font-medium mb-1">{getActionText(entry)}</p>
                            <p className="text-xs text-gray-500">
                              {formatDistanceToNow(new Date(entry.created_at), { addSuffix: true })}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-gray-200 dark:border-gray-800">
              <button
                onClick={onClose}
                className="w-full btn-secondary"
              >
                Close
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
