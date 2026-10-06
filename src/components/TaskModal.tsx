import { useState, FormEvent, useEffect, useCallback } from 'react'
import { Task, Subtask, Tag } from '@/types'
import { motion, AnimatePresence } from 'framer-motion'
import { DEFAULT_TEMPLATES, TaskTemplate } from '@/data/templates'
import { parseNaturalLanguage } from '@/utils/naturalLanguageParser'
import { useTags } from '@/hooks/useTags'
import TagPicker from './TagPicker'

interface TaskModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (task: Partial<Task>, subtasks?: Partial<Subtask>[], tags?: Tag[]) => Promise<void>
  task?: Task | null
  defaultDate?: string
  existingSubtasks?: Subtask[]
}

export default function TaskModal({ isOpen, onClose, onSave, task, defaultDate, existingSubtasks = [] }: TaskModalProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [date, setDate] = useState('')
  const [priority, setPriority] = useState<'low' | 'medium' | 'high' | undefined>(undefined)
  const [recurrence, setRecurrence] = useState<'none' | 'daily' | 'weekly' | 'biweekly' | 'monthly'>('none')
  const [subtasks, setSubtasks] = useState<Partial<Subtask>[]>([])
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('')
  const [showTemplates, setShowTemplates] = useState(false)
  const [saving, setSaving] = useState(false)
  const [selectedTags, setSelectedTags] = useState<Tag[]>([])
  
  const { tags, createTag, getTaskTags } = useTags()

  useEffect(() => {
    const loadData = async () => {
      if (task) {
        setTitle(task.title)
        setDescription(task.description || '')
        setDate(task.date)
        setPriority(task.priority)
        setRecurrence(task.recurrence || 'none')
        setSubtasks(existingSubtasks)
        
        // Load task tags
        const taskTags = await getTaskTags(task.id)
        setSelectedTags(taskTags)
      } else if (defaultDate) {
        setTitle('')
        setDescription('')
        setDate(defaultDate)
        setPriority(undefined)
        setRecurrence('none')
        setSubtasks([])
        setSelectedTags([])
      } else {
        setTitle('')
        setDescription('')
        setDate(new Date().toISOString().split('T')[0])
        setPriority(undefined)
        setRecurrence('none')
        setSubtasks([])
        setSelectedTags([])
      }
      setNewSubtaskTitle('')
    }
    
    if (isOpen) {
      loadData()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [task?.id, defaultDate, isOpen])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return

    setSaving(true)
    try {
      await onSave({
        ...(task && { id: task.id }),
        title: title.trim(),
        description: description.trim() || null,
        date,
        completed: task?.completed || false,
        order_index: task?.order_index || 0,
        priority: priority,
        recurrence: recurrence === 'none' ? null : recurrence,
        recurrence_parent_id: task?.recurrence_parent_id || null,
      }, subtasks, selectedTags)

      handleClose()
    } finally {
      setSaving(false)
    }
  }

  const handleClose = useCallback(() => {
    if (saving) return // Prevent closing while saving
    setTitle('')
    setDescription('')
    setSubtasks([])
    setNewSubtaskTitle('')
    onClose()
  }, [saving, onClose])

  const addSubtask = () => {
    if (!newSubtaskTitle.trim()) return
    
    setSubtasks([...subtasks, {
      title: newSubtaskTitle.trim(),
      completed: false,
      order_index: subtasks.length,
      task_id: task?.id
    }])
    setNewSubtaskTitle('')
  }

  const handleSubtaskKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addSubtask()
    }
  }

  const applyTemplate = (template: TaskTemplate) => {
    setTitle(template.title)
    setDescription(template.description || '')
    setPriority(template.priority)
    if (template.subtasks) {
      setSubtasks(template.subtasks.map((title, index) => ({
        title,
        completed: false,
        order_index: index
      })))
    }
    setShowTemplates(false)
  }

  const removeSubtask = (index: number) => {
    setSubtasks(subtasks.filter((_, i) => i !== index))
  }

  const toggleSubtask = (index: number) => {
    setSubtasks(subtasks.map((st, i) => 
      i === index ? { ...st, completed: !st.completed } : st
    ))
  }

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !saving) {
        handleClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, saving, handleClose])

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
          className="relative w-full max-w-md card p-6 z-10 max-h-[90vh] overflow-y-auto"
          role="dialog"
          aria-modal="true"
          aria-labelledby="task-modal-title"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 id="task-modal-title" className="text-xl font-light">
              {task ? 'Edit Task' : 'New Task'}
            </h2>
            <div className="flex items-center gap-2">
              {!task && (
                <button
                  type="button"
                  onClick={() => setShowTemplates(!showTemplates)}
                  aria-label="Choose from task templates"
                  aria-expanded={showTemplates}
                  className="text-gray-500 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
                  title="Use template"
                >
                  <span className="material-symbols-outlined text-xl" aria-hidden="true">auto_awesome</span>
                </button>
              )}
              <button
                onClick={handleClose}
                aria-label="Close dialog"
                className="text-gray-400 hover:text-black dark:hover:text-white"
              >
                <span className="material-symbols-outlined text-xl" aria-hidden="true">close</span>
              </button>
            </div>
          </div>

          {/* Templates Section */}
          {showTemplates && !task && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-6 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800"
            >
              <h3 className="text-sm font-medium mb-3">Quick Templates</h3>
              <div className="grid grid-cols-2 gap-2">
                {DEFAULT_TEMPLATES.map((template) => (
                  <button
                    key={template.id}
                    type="button"
                    onClick={() => applyTemplate(template)}
                    className="text-left p-3 rounded bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 
                             hover:border-gray-400 dark:hover:border-gray-600 transition-all text-sm"
                  >
                    <div className="font-medium mb-1">{template.name}</div>
                    {template.subtasks && (
                      <div className="text-xs text-gray-500">
                        {template.subtasks.length} items
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" aria-label={task ? 'Edit task form' : 'Create task form'}>
            <div>
              <label htmlFor="title" className="block text-sm font-medium mb-2">
                Title
              </label>
              <input
                id="title"
                type="text"
                value={title}
                onChange={(e) => {
                  const value = e.target.value
                  setTitle(value)
                  
                  // Auto-parse natural language if creating new task
                  if (!task && value.length > 5) {
                    const parsed = parseNaturalLanguage(value)
                    if (parsed.date !== date && !defaultDate) {
                      setDate(parsed.date)
                    }
                    if (parsed.priority && !priority) {
                      setPriority(parsed.priority)
                    }
                  }
                }}
                className="input-base"
                placeholder="e.g., 'Team meeting Friday at 2pm high priority'"
                autoFocus
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                💡 Tip: Include dates, times, and priorities in your title
              </p>
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
                onChange={(e) => setRecurrence(e.target.value as 'none' | 'daily' | 'weekly' | 'biweekly' | 'monthly')}
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

            {/* Tags */}
            <TagPicker
              selectedTags={selectedTags}
              availableTags={tags}
              onTagAdd={(tag) => setSelectedTags(prev => [...prev, tag])}
              onTagRemove={(tagId) => setSelectedTags(prev => prev.filter(t => t.id !== tagId))}
              onTagCreate={async (name, color) => {
                const result = await createTag(name, color)
                if (result.data) {
                  setSelectedTags(prev => [...prev, result.data])
                }
              }}
            />

            <div>
              <label className="block text-sm font-medium mb-2">
                Checklist <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              
              {/* Existing subtasks */}
              {subtasks.length > 0 && (
                <div className="space-y-2 mb-3">
                  <AnimatePresence>
                    {subtasks.map((subtask, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="flex items-center gap-2 p-2 rounded bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800"
                      >
                        <button
                          type="button"
                          onClick={() => toggleSubtask(index)}
                          aria-label={`Toggle checklist item: ${subtask.title}`}
                          aria-checked={subtask.completed}
                          role="checkbox"
                          className="w-4 h-4 rounded border-2 border-gray-400 dark:border-gray-600 flex items-center justify-center flex-shrink-0 hover:border-gray-900 dark:hover:border-gray-100 transition-colors"
                        >
                          {subtask.completed && (
                            <div className="w-2 h-2 bg-gray-900 dark:bg-gray-100 rounded-sm" />
                          )}
                        </button>
                        <span className={`flex-1 text-sm ${subtask.completed ? 'line-through text-gray-500' : ''}`}>
                          {subtask.title}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeSubtask(index)}
                          aria-label={`Remove checklist item: ${subtask.title}`}
                          className="text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 flex-shrink-0"
                        >
                          <span className="material-symbols-outlined text-base">close</span>
                        </button>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}

              {/* Add new subtask */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newSubtaskTitle}
                  onChange={(e) => setNewSubtaskTitle(e.target.value)}
                  onKeyDown={handleSubtaskKeyDown}
                  aria-label="New checklist item"
                  className="input-base flex-1"
                  placeholder="Add a checklist item... (Press Enter)"
                />
                <button
                  type="button"
                  onClick={addSubtask}
                  disabled={!newSubtaskTitle.trim()}
                  className="px-4 py-2 rounded bg-gray-100 dark:bg-gray-900 hover:bg-gray-200 dark:hover:bg-gray-800 
                           disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm font-medium"
                >
                  Add
                </button>
              </div>
              {subtasks.length > 0 && (
                <p className="text-xs text-gray-500 mt-2">
                  {subtasks.filter(st => st.completed).length}/{subtasks.length} items completed
                </p>
              )}
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={handleClose}
                className="btn-secondary flex-1"
                disabled={saving}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-primary flex-1"
                disabled={saving}
              >
                {saving ? 'Saving...' : (task ? 'Save' : 'Create')}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
