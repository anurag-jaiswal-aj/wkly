import { Task } from '@/types'
import TaskCard from './TaskCard'
import EmptyState from './EmptyState'
import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { format, isToday } from 'date-fns'
import { memo } from 'react'

interface DayColumnProps {
  date: Date
  tasks: Task[]
  onTaskEdit: (task: Task) => void
  onTaskToggle: (id: string, completed: boolean) => void
  onTaskDelete: (id: string) => void
  onAddTask: (date: string) => void
  showDatesOnTasks?: boolean
}

// Memoize DayColumn to prevent unnecessary re-renders
const DayColumn = memo(function DayColumn({
  date,
  tasks,
  onTaskEdit,
  onTaskToggle,
  onTaskDelete,
  onAddTask,
  showDatesOnTasks,
}: DayColumnProps) {
  const dateStr = format(date, 'yyyy-MM-dd')
  const { setNodeRef, isOver } = useDroppable({
    id: dateStr,
  })

  const today = isToday(date)

  return (
    <div
      ref={setNodeRef}
      role="region"
      aria-label={`Tasks for ${format(date, 'EEEE, MMMM d, yyyy')}`}
      className={`
        flex-1 min-w-0 border-r border-gray-200 dark:border-gray-800 last:border-r-0
        ${today ? 'bg-gray-50 dark:bg-gray-900' : ''}
        ${isOver ? 'bg-gray-100 dark:bg-gray-800' : ''}
        transition-colors
      `}
    >
      <div className="p-4 border-b border-gray-200 dark:border-gray-800 sticky top-0 
                      bg-white dark:bg-black z-10">
        <div className="text-center">
          <div className="text-xs uppercase tracking-wider text-gray-500 mb-1">
            {format(date, 'EEE')}
          </div>
          <div className={`text-2xl font-light ${today ? 'font-medium' : ''}`}>
            {format(date, 'd')}
          </div>
        </div>
      </div>

      <div className="p-3">
        <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onEdit={onTaskEdit}
              onToggle={onTaskToggle}
              onDelete={onTaskDelete}
              showDate={showDatesOnTasks}
            />
          ))}
        </SortableContext>

        {tasks.length === 0 && !isOver && (
          <EmptyState
            icon="event_available"
            title={today ? "Start your day" : "No tasks"}
            description={today ? "Add tasks to organize your day" : "Plan ahead by adding tasks"}
            action={{
              label: "+ Add task",
              onClick: () => onAddTask(dateStr)
            }}
          />
        )}

        <button
          onClick={() => onAddTask(dateStr)}
          aria-label={`Add task for ${format(date, 'EEEE, MMMM d')}`}
          data-tour="add-task"
          className="w-full py-2.5 text-sm text-gray-400 hover:text-black dark:hover:text-white 
                     border border-dashed border-gray-300 dark:border-gray-700
                     hover:border-gray-500 dark:hover:border-gray-500
                     hover:bg-gray-50 dark:hover:bg-gray-900
                     transition-all mt-2 rounded"
        >
          + Add task
        </button>
      </div>
    </div>
  )
})

export default DayColumn
