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
        flex-1 min-w-[280px] sm:min-w-[200px] lg:min-w-[220px] max-w-[400px] lg:max-w-none
        border-r border-gray-200 dark:border-gray-800 last:border-r-0
        flex flex-col h-full
        ${today ? 'bg-gray-50 dark:bg-gray-900' : ''}
        ${isOver ? 'bg-gray-100 dark:bg-gray-800' : ''}
        transition-colors
      `}
    >
      <div className="p-3 md:p-4 border-b border-gray-200 dark:border-gray-800 flex-shrink-0
                      bg-white dark:bg-black">
        <div className="text-center">
          <div className="text-xs uppercase tracking-wider text-gray-500 mb-0.5 md:mb-1">
            {format(date, 'EEE')}
          </div>
          <div className={`text-xl md:text-2xl font-light ${today ? 'font-medium' : ''}`}>
            {format(date, 'd')}
          </div>
        </div>
      </div>

      <div className="p-2 md:p-3 flex-1 min-h-0 overflow-y-auto">
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
          />
        )}

        <button
          onClick={() => onAddTask(dateStr)}
          aria-label={`Add task for ${format(date, 'EEEE, MMMM d')}`}
          data-tour="add-task"
          className="w-full py-2 md:py-2.5 text-xs md:text-sm text-gray-400 hover:text-black dark:hover:text-white 
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
