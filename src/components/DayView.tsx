import { format, addDays, subDays, isToday } from 'date-fns'
import { Task } from '@/types'
import { DndContext, DragEndEvent, useSensor, useSensors, PointerSensor, DragOverlay } from '@dnd-kit/core'
import { useDroppable } from '@dnd-kit/core'
import TaskCard from './TaskCard'
import { useState, useEffect, useRef } from 'react'

interface DayViewProps {
  currentDate: Date
  tasks: Task[]
  onDateChange: (date: Date) => void
  onTaskEdit: (task: Task) => void
  onTaskToggle: (id: string, completed: boolean) => void
  onTaskDelete: (id: string) => void
  onAddTask: (date: string, time?: string) => void
  onTaskReorder: (taskId: string, newDate: string, newOrderIndex: number, newTime?: string) => void
}

interface TimeSlotProps {
  hour: number
  date: Date
  tasks: Task[]
  onTaskEdit: (task: Task) => void
  onTaskToggle: (id: string, completed: boolean) => void
  onAddTask: (date: string, time: string) => void
}

function TimeSlot({ hour, date, tasks, onTaskEdit, onTaskToggle, onAddTask }: TimeSlotProps) {
  const timeStr = `${hour.toString().padStart(2, '0')}:00`
  const dateStr = format(date, 'yyyy-MM-dd')
  const slotId = `${dateStr}-${timeStr}`
  
  const { setNodeRef, isOver } = useDroppable({
    id: slotId,
  })

  // Filter tasks for this hour
  const hourTasks = tasks.filter(task => {
    if (!task.reminder_time) return false
    const taskHour = parseInt(task.reminder_time.split(':')[0])
    return taskHour === hour
  })

  return (
    <div
      ref={setNodeRef}
      className={`
        border-b border-gray-200 dark:border-gray-800 min-h-[80px] p-2
        ${isOver ? 'bg-blue-50 dark:bg-blue-950' : 'hover:bg-gray-50 dark:hover:bg-gray-950'}
        transition-colors group
      `}
    >
      <div className="flex gap-2">
        <div className="w-16 flex-shrink-0 text-xs text-gray-500 pt-1">
          {format(new Date().setHours(hour, 0, 0, 0), 'h:mm a')}
        </div>
        <div className="flex-1 space-y-1">
          {hourTasks.map(task => (
            <div
              key={task.id}
              onClick={() => onTaskEdit(task)}
              className="cursor-pointer"
            >
              <div className="text-xs p-2 rounded bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={task.completed}
                    onChange={(e) => {
                      e.stopPropagation()
                      onTaskToggle(task.id, !task.completed)
                    }}
                    className="flex-shrink-0 w-3 h-3 rounded"
                  />
                  <span className={`flex-1 ${task.completed ? 'line-through text-gray-500' : 'font-medium'}`}>
                    {task.title}
                  </span>
                  {task.priority === 'high' && <span className="text-red-500 text-xs">●</span>}
                  {task.priority === 'medium' && <span className="text-yellow-500 text-xs">●</span>}
                </div>
                {task.description && (
                  <p className="text-xs text-gray-500 mt-1 line-clamp-1">{task.description}</p>
                )}
              </div>
            </div>
          ))}
          <button
            onClick={() => onAddTask(dateStr, timeStr)}
            className="opacity-0 group-hover:opacity-100 w-full text-left text-xs text-gray-400 hover:text-blue-500 transition-opacity p-1"
          >
            + Add task
          </button>
        </div>
      </div>
    </div>
  )
}

export default function DayView({
  currentDate,
  tasks,
  onDateChange,
  onTaskEdit,
  onTaskToggle,
  onTaskDelete,
  onAddTask,
  onTaskReorder
}: DayViewProps) {
  const [activeTask, setActiveTask] = useState<Task | null>(null)
  const [currentTime, setCurrentTime] = useState(new Date())
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  )

  // Update current time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 60000)
    return () => clearInterval(timer)
  }, [])

  // Scroll to current hour on mount
  useEffect(() => {
    if (scrollContainerRef.current && isToday(currentDate)) {
      const currentHour = new Date().getHours()
      const scrollPosition = currentHour * 80 - 200 // 80px per hour, offset by 200px
      scrollContainerRef.current.scrollTop = Math.max(0, scrollPosition)
    }
  }, [currentDate])

  const dateStr = format(currentDate, 'yyyy-MM-dd')
  const dayTasks = tasks.filter(t => t.date === dateStr)

  // Separate timed and untimed tasks
  const timedTasks = dayTasks.filter(t => t.reminder_time)
  const untimedTasks = dayTasks.filter(t => !t.reminder_time).sort((a, b) => a.order_index - b.order_index)

  const hours = Array.from({ length: 24 }, (_, i) => i)

  // Droppable for untimed area
  const { setNodeRef: setUntimedNodeRef } = useDroppable({ id: dateStr })

  const goToPreviousDay = () => {
    onDateChange(subDays(currentDate, 1))
  }

  const goToNextDay = () => {
    onDateChange(addDays(currentDate, 1))
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
    const overId = over.id as string

    // Parse the drop target
    if (overId.includes('-')) {
      // Dropped on a time slot
      const [newDate, newTime] = overId.split('-')
      const tasksInSlot = tasks.filter(t => t.date === newDate && t.reminder_time === newTime && t.id !== taskId)
      onTaskReorder(taskId, newDate, tasksInSlot.length, newTime)
    } else {
      // Dropped in untimed section
      const tasksInDate = tasks.filter(t => t.date === overId && !t.reminder_time && t.id !== taskId)
      onTaskReorder(taskId, overId, tasksInDate.length)
    }
  }

  const getCurrentTimePosition = () => {
    if (!isToday(currentDate)) return null
    const hours = currentTime.getHours()
    const minutes = currentTime.getMinutes()
    const position = (hours * 80) + (minutes / 60 * 80)
    return position
  }

  const timeIndicatorPosition = getCurrentTimePosition()

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="border-b border-gray-200 dark:border-gray-800 p-3 md:p-4 flex flex-col sm:flex-row items-center justify-between gap-3 flex-shrink-0">
        <div className="flex items-center gap-2 md:gap-4">
          <button
            onClick={goToPreviousDay}
            className="text-gray-500 hover:text-black dark:hover:text-white p-1"
            aria-label="Previous day"
          >
            <span className="material-symbols-outlined text-xl md:text-2xl">chevron_left</span>
          </button>
          <h2 className="text-base md:text-lg font-light whitespace-nowrap min-w-[200px] text-center">
            {format(currentDate, 'EEEE, MMMM d, yyyy')}
          </h2>
          <button
            onClick={goToNextDay}
            className="text-gray-500 hover:text-black dark:hover:text-white p-1"
            aria-label="Next day"
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

      {/* Day Content */}
      <div className="flex-1 min-h-0 overflow-hidden">
        <DndContext
          sensors={sensors}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="h-full flex flex-col lg:flex-row">
            {/* Hourly Schedule */}
            <div className="flex-1 overflow-auto relative" ref={scrollContainerRef}>
              {/* Current time indicator */}
              {timeIndicatorPosition !== null && (
                <div
                  className="absolute left-0 right-0 z-10 pointer-events-none"
                  style={{ top: `${timeIndicatorPosition}px` }}
                >
                  <div className="flex items-center">
                    <div className="w-16 flex-shrink-0 pr-2 text-right">
                      <span className="text-xs font-medium text-red-500">
                        {format(currentTime, 'h:mm a')}
                      </span>
                    </div>
                    <div className="h-0.5 bg-red-500 flex-1"></div>
                  </div>
                </div>
              )}

              <div className="min-h-full">
                {hours.map(hour => (
                  <TimeSlot
                    key={hour}
                    hour={hour}
                    date={currentDate}
                    tasks={timedTasks}
                    onTaskEdit={onTaskEdit}
                    onTaskToggle={onTaskToggle}
                    onAddTask={onAddTask}
                  />
                ))}
              </div>
            </div>

            {/* Untimed Tasks Sidebar */}
            {untimedTasks.length > 0 && (
              <div className="w-full lg:w-80 border-t lg:border-t-0 lg:border-l border-gray-200 dark:border-gray-800 p-4 overflow-y-auto bg-gray-50 dark:bg-gray-950">
                <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-3">
                  Untimed Tasks
                </h3>
                <div ref={setUntimedNodeRef} className="space-y-2">
                  {untimedTasks.map(task => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onEdit={onTaskEdit}
                      onToggle={onTaskToggle}
                      onDelete={onTaskDelete}
                      showDate={false}
                    />
                  ))}
                </div>
              </div>
            )}
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
