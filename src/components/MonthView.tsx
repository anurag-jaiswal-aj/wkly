import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, addMonths, subMonths, startOfWeek, endOfWeek } from 'date-fns'
import { Task } from '@/types'
import { DndContext, DragEndEvent, useSensor, useSensors, PointerSensor, DragOverlay } from '@dnd-kit/core'
import { useDroppable } from '@dnd-kit/core'
import TaskCard from './TaskCard'
import { useState } from 'react'

interface MonthViewProps {
  currentDate: Date
  tasks: Task[]
  onDateChange: (date: Date) => void
  onTaskEdit: (task: Task) => void
  onTaskToggle: (id: string, completed: boolean) => void
  onTaskDelete: (id: string) => void
  onAddTask: (date: string) => void
  onTaskReorder: (taskId: string, newDate: string, newOrderIndex: number) => void
}

interface CalendarDayProps {
  date: Date
  currentMonth: Date
  tasks: Task[]
  onTaskEdit: (task: Task) => void
  onTaskToggle: (id: string, completed: boolean) => void
  onAddTask: (date: string) => void
}

function CalendarDay({ date, currentMonth, tasks, onTaskEdit, onTaskToggle, onAddTask }: CalendarDayProps) {
  const dateStr = format(date, 'yyyy-MM-dd')
  const isCurrentMonth = isSameMonth(date, currentMonth)
  const today = isToday(date)
  
  const { setNodeRef, isOver } = useDroppable({
    id: dateStr,
  })

  const dayTasks = tasks
    .filter(t => t.date === dateStr)
    .sort((a, b) => a.order_index - b.order_index)

  const displayedTasks = dayTasks.slice(0, 3)
  const remainingCount = dayTasks.length - 3

  return (
    <div
      ref={setNodeRef}
      className={`
        min-h-[120px] max-h-[200px] border border-gray-200 dark:border-gray-800 p-2 flex flex-col
        ${!isCurrentMonth ? 'bg-gray-50 dark:bg-gray-950 opacity-50' : 'bg-white dark:bg-black'}
        ${today ? 'ring-2 ring-blue-500 dark:ring-blue-400' : ''}
        ${isOver ? 'bg-blue-50 dark:bg-blue-950' : ''}
        transition-colors group
      `}
    >
      <div className="flex items-center justify-between mb-1 flex-shrink-0">
        <span className={`text-sm font-medium ${
          today ? 'text-blue-600 dark:text-blue-400' : 
          isCurrentMonth ? 'text-gray-900 dark:text-gray-100' : 'text-gray-400 dark:text-gray-600'
        }`}>
          {format(date, 'd')}
        </span>
        {isCurrentMonth && (
          <button
            onClick={() => onAddTask(dateStr)}
            className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-blue-500 transition-opacity"
            aria-label={`Add task for ${format(date, 'MMMM d')}`}
          >
            <span className="material-symbols-outlined text-sm">add</span>
          </button>
        )}
      </div>

      <div className="space-y-1 flex-1 min-h-0 overflow-y-auto">
        {displayedTasks.map(task => (
          <div
            key={task.id}
            className="text-xs p-1.5 rounded cursor-pointer hover:shadow-sm transition-shadow
                     bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-800"
            onClick={() => onTaskEdit(task)}
          >
            <div className="flex items-center gap-1">
              <input
                type="checkbox"
                checked={task.completed}
                onChange={(e) => {
                  e.stopPropagation()
                  onTaskToggle(task.id, !task.completed)
                }}
                className="flex-shrink-0 w-3 h-3 rounded"
              />
              <span className={`truncate flex-1 ${task.completed ? 'line-through text-gray-500' : ''}`}>
                {task.title}
              </span>
              {task.priority === 'high' && <span className="text-red-500">●</span>}
              {task.priority === 'medium' && <span className="text-yellow-500">●</span>}
            </div>
          </div>
        ))}
        
        {remainingCount > 0 && (
          <div className="text-xs text-gray-500 pl-1">
            +{remainingCount} more
          </div>
        )}
      </div>
    </div>
  )
}

export default function MonthView({
  currentDate,
  tasks,
  onDateChange,
  onTaskEdit,
  onTaskToggle,
  onAddTask,
  onTaskReorder
}: MonthViewProps) {
  const [activeTask, setActiveTask] = useState<Task | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  )

  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(currentDate)
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 })
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 })

  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd })
  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

  const goToPreviousMonth = () => {
    onDateChange(subMonths(currentDate, 1))
  }

  const goToNextMonth = () => {
    onDateChange(addMonths(currentDate, 1))
  }

  const goToToday = () => {
    onDateChange(new Date())
  }

  const handleDragStart = (event: DragEndEvent) => {
    const task = tasks.find(t => t.id === event.active.id)
    setActiveTask(task || null)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    setActiveTask(null)

    if (!over) return

    const taskId = active.id as string
    const newDate = over.id as string

    const tasksInNewDate = tasks.filter(t => t.date === newDate && t.id !== taskId)
    const newOrderIndex = tasksInNewDate.length

    onTaskReorder(taskId, newDate, newOrderIndex)
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="border-b border-gray-200 dark:border-gray-800 p-3 md:p-4 flex flex-col sm:flex-row items-center justify-between gap-3 flex-shrink-0">
        <div className="flex items-center gap-2 md:gap-4">
          <button
            onClick={goToPreviousMonth}
            className="text-gray-500 hover:text-black dark:hover:text-white p-1"
            aria-label="Previous month"
          >
            <span className="material-symbols-outlined text-xl md:text-2xl">chevron_left</span>
          </button>
          <h2 className="text-base md:text-lg font-light whitespace-nowrap min-w-[150px] text-center">
            {format(currentDate, 'MMMM yyyy')}
          </h2>
          <button
            onClick={goToNextMonth}
            className="text-gray-500 hover:text-black dark:hover:text-white p-1"
            aria-label="Next month"
          >
            <span className="material-symbols-outlined text-xl md:text-2xl">chevron_right</span>
          </button>
        </div>

        <button
          onClick={goToToday}
          className="btn-secondary text-xs md:text-sm px-3 py-1.5 md:py-2 w-full sm:w-auto"
        >
          Today
        </button>
      </div>

      {/* Calendar Grid */}
      <div className="flex-1 min-h-0 overflow-auto p-2 md:p-4">
        <DndContext
          sensors={sensors}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="h-full min-w-[600px]">
            {/* Week day headers */}
            <div className="grid grid-cols-7 mb-2">
              {weekDays.map(day => (
                <div
                  key={day}
                  className="text-center text-xs font-medium text-gray-500 dark:text-gray-400 py-2"
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar days */}
            <div className="grid grid-cols-7 gap-0 auto-rows-fr group">
              {days.map(day => (
                <CalendarDay
                  key={day.toISOString()}
                  date={day}
                  currentMonth={currentDate}
                  tasks={tasks}
                  onTaskEdit={onTaskEdit}
                  onTaskToggle={onTaskToggle}
                  onAddTask={onAddTask}
                />
              ))}
            </div>
          </div>

          <DragOverlay>
            {activeTask && (
              <div className="w-64">
                <TaskCard
                  task={activeTask}
                  onEdit={() => {}}
                  onToggle={() => {}}
                  onDelete={() => {}}
                  showDate={true}
                />
              </div>
            )}
          </DragOverlay>
        </DndContext>
      </div>
    </div>
  )
}
