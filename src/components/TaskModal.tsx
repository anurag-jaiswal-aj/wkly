import { useState, FormEvent, useEffect } from 'react'
import { Task } from '@/types'
import { motion, AnimatePresence } from 'framer-motion'

interface TaskModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (task: Partial<Task>) => void
  task?: Task | null
  defaultDate?: string
}

export default function TaskModal({ isOpen, onClose, onSave, task, defaultDate }: TaskModalProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [date, setDate] = useState('')
  const [priority, setPriority] = useState<'low' | 'medium' | 'high' | undefined>(undefined)
  const [recurrence, setRecurrence] = useState<'none' | 'daily' | 'weekly' | 'biweekly' | 'monthly'>('none')

  useEffect(() => {
    if (task) {
      setTitle(task.title)
      setDescription(task.description || '')
      setDate(task.date)
      setPriority(task.priority)
      setRecurrence(task.recurrence || 'none')
    } else if (defaultDate) {
      setTitle('')
      setDescription('')
      setDate(defaultDate)
      setPriority(undefined)
      setRecurrence('none')
    } else {
      setTitle('')
      setDescription('')
      setDate(new Date().toISOString().split('T')[0])
      setPriority(undefined)
      setRecurrence('none')
    }
  }, [task, defaultDate, isOpen])

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return

    onSave({
      ...(task && { id: task.id }),
      title: title.trim(),
      description: description.trim() || null,
      date,
      completed: task?.completed || false,
      order_index: task?.order_index || 0,
      priority: priority,
      recurrence: recurrence === 'none' ? null : recurrence,
      recurrence_parent_id: task?.recurrence_parent_id || null,
    })

    onClose()
  }

  const handleClose = () => {
    setTitle('')
    setDescription('')
    onClose()
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
          className="absolute inset-0 bg-black/50"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: 'spring', duration: 0.3 }}
          className="relative w-full max-w-md card p-6 z-10"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-light">
              {task ? 'Edit Task' : 'New Task'}
            </h2>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-black dark:hover:text-white"
            >
              <span className="material-symbols-outlined text-xl">close</span>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium mb-2">
                Title
              </label>
              <input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="input-base"
                placeholder="What needs to be done?"
                autoFocus
                required
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium mb-2">
                Description <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="input-base resize-none"
                rows={3}
                placeholder="Add more details..."
              />
            </div>

            <div>
              <label htmlFor="date" className="block text-sm font-medium mb-2">
                Date
              </label>
              <input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="input-base"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Priority <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setPriority(priority === 'low' ? undefined : 'low')}
                  className={`flex-1 py-2 px-3 text-sm rounded border transition-all ${
                    priority === 'low'
                      ? 'bg-gray-300 dark:bg-gray-700 border-gray-400 dark:border-gray-600'
                      : 'border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-900'
                  }`}
                >
                  ! Low
                </button>
                <button
                  type="button"
                  onClick={() => setPriority(priority === 'medium' ? undefined : 'medium')}
                  className={`flex-1 py-2 px-3 text-sm rounded border transition-all ${
                    priority === 'medium'
                      ? 'bg-gray-600 dark:bg-gray-400 text-white dark:text-black border-gray-700 dark:border-gray-300'
                      : 'border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-900'
                  }`}
                >
                  !! Medium
                </button>
                <button
                  type="button"
                  onClick={() => setPriority(priority === 'high' ? undefined : 'high')}
                  className={`flex-1 py-2 px-3 text-sm rounded border transition-all ${
                    priority === 'high'
                      ? 'bg-gray-900 dark:bg-gray-100 text-white dark:text-black border-black dark:border-gray-200'
                      : 'border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-900'
                  }`}
                >
                  !!! High
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Repeat <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <select
                value={recurrence}
                onChange={(e) => setRecurrence(e.target.value as any)}
                className="input-base"
              >
                <option value="none">Does not repeat</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="biweekly">Bi-weekly</option>
                <option value="monthly">Monthly</option>
              </select>
              {recurrence !== 'none' && (
                <p className="text-xs text-gray-500 mt-1">
                  <span className="material-symbols-outlined text-xs align-middle">loop</span> Task will auto-create when completed
                </p>
              )}
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={handleClose}
                className="btn-secondary flex-1"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-primary flex-1"
              >
                {task ? 'Save' : 'Create'}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
