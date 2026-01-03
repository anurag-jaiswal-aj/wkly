import { Task } from '@/types'
import { motion } from 'framer-motion'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { format, parseISO } from 'date-fns'

interface TaskCardProps {
  task: Task
  onEdit: (task: Task) => void
  onToggle: (id: string, completed: boolean) => void
  onDelete: (id: string) => void
  showDate?: boolean
}

export default function TaskCard({ task, onEdit, onToggle, onDelete, showDate }: TaskCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const getPriorityColor = () => {
    if (!task.priority) return ''
    switch (task.priority) {
      case 'high': return 'border-l-4 border-l-black dark:border-l-white'
      case 'medium': return 'border-l-4 border-l-gray-600 dark:border-l-gray-400'
      case 'low': return 'border-l-4 border-l-gray-300 dark:border-l-gray-700'
      default: return ''
    }
  }

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: isDragging ? 0.5 : 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
      className={`
        group p-4 mb-2 card cursor-grab active:cursor-grabbing
        hover:shadow-lg hover:border-gray-400 dark:hover:border-gray-500
        hover:-translate-y-0.5 transition-all duration-200
        ${task.completed ? 'opacity-60' : ''}
        ${isDragging ? 'shadow-2xl z-50 scale-105' : ''}
        ${getPriorityColor()}
      `}
    >
      <div className="flex items-start gap-3">
        <button
          onClick={(e) => {
            e.stopPropagation()
            onToggle(task.id, !task.completed)
          }}
          className="mt-1 flex-shrink-0 w-5 h-5 rounded border-2 border-gray-400 dark:border-gray-600 
                     hover:border-black dark:hover:border-white hover:scale-110 transition-all duration-150
                     flex items-center justify-center"
        >
          {task.completed && (
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="w-2.5 h-2.5 bg-black dark:bg-white rounded-sm" 
            />
          )}
        </button>

        <div className="flex-1 min-w-0" onClick={() => onEdit(task)}>
          <div className="flex items-center gap-2 mb-1">
            <p className={`text-sm font-medium ${task.completed ? 'line-through text-gray-500' : 'text-gray-900 dark:text-gray-100'}`}>
              {task.title}
            </p>
            {showDate && (
              <span className="text-xs px-2 py-0.5 rounded bg-gray-200 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                {format(parseISO(task.date), 'MMM d')}
              </span>
            )}
            {task.priority && (
              <span className={`text-xs px-1.5 py-0.5 rounded ${
                task.priority === 'high' ? 'bg-gray-900 dark:bg-gray-100 text-white dark:text-black' :
                task.priority === 'medium' ? 'bg-gray-600 dark:bg-gray-400 text-white dark:text-black' :
                'bg-gray-300 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}>
                {task.priority === 'high' ? '!!!' : task.priority === 'medium' ? '!!' : '!'}
              </span>
            )}
            {task.reminder_time && task.reminder_enabled !== false && (
              <span className="text-xs px-1.5 py-0.5 rounded bg-gray-200 dark:bg-gray-800 text-gray-600 dark:text-gray-400" title={`Reminder at ${task.reminder_time}`}>
                🔔 {task.reminder_time}
              </span>
            )}
          </div>
          {task.description && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
              {task.description}
            </p>
          )}
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation()
            if (confirm('Delete this task?')) {
              onDelete(task.id)
            }
          }}
          className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-gray-900
                     dark:hover:text-gray-100 text-lg transition-all hover:scale-125 flex-shrink-0"
        >
          ×
        </button>
      </div>
    </motion.div>
  )
}
