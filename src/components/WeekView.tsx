import { useState } from 'react'
import { Task } from '@/types'
import DayColumn from './DayColumn'
import {
  addDays,
  startOfWeek,
  format,
  addWeeks,
  subWeeks,
} from 'date-fns'
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import TaskCard from './TaskCard'

interface WeekViewProps {
  weekStart: Date
  tasks: Task[]
  onTaskEdit: (task: Task) => void
  onTaskToggle: (id: string, completed: boolean) => void
  onTaskDelete: (id: string) => void
  onTaskReorder: (taskId: string, newDate: string, newOrderIndex: number) => void
  onAddTask: (date: string) => void
  onWeekChange: (date: Date) => void
  isSearching?: boolean
}

export default function WeekView({
  weekStart,
  tasks,
  onTaskEdit,
  onTaskToggle,
  onTaskDelete,
  onTaskReorder,
  onAddTask,
  onWeekChange,
  isSearching,
}: WeekViewProps) {
  const [activeTask, setActiveTask] = useState<Task | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  )

  const days = Array.from({ length: 7 }, (_, i) => {
    return addDays(startOfWeek(weekStart, { weekStartsOn: 1 }), i)
  })

  const getTasksForDate = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd')
    return tasks
      .filter((task) => task.date === dateStr)
      .sort((a, b) => a.order_index - b.order_index)
  }

  const handleDragStart = (event: DragEndEvent) => {
    const task = tasks.find((t) => t.id === event.active.id)
    setActiveTask(task || null)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    setActiveTask(null)

    if (!over) return

    const taskId = active.id as string
    const newDate = over.id as string

    const tasksInNewDate = tasks.filter((t) => t.date === newDate && t.id !== taskId)
    const newOrderIndex = tasksInNewDate.length

    onTaskReorder(taskId, newDate, newOrderIndex)
  }

  const goToPreviousWeek = () => {
    onWeekChange(subWeeks(weekStart, 1))
  }

  const goToNextWeek = () => {
    onWeekChange(addWeeks(weekStart, 1))
  }

  const goToToday = () => {
    onWeekChange(new Date())
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="border-b border-gray-200 dark:border-gray-800 p-3 md:p-4 flex flex-col sm:flex-row items-center justify-between gap-3 flex-shrink-0">
        <div className="flex items-center gap-2 md:gap-4" data-tour="week-navigation">
          <button
            onClick={goToPreviousWeek}
            className="text-gray-500 hover:text-black dark:hover:text-white p-1"
            aria-label="Previous week"
          >
            <span className="material-symbols-outlined text-xl md:text-2xl">chevron_left</span>
          </button>
          <h2 className="text-base md:text-lg font-light whitespace-nowrap">
            {format(days[0], 'MMM d')} – {format(days[6], 'MMM d, yyyy')}
          </h2>
          <button
            onClick={goToNextWeek}
            className="text-gray-500 hover:text-black dark:hover:text-white p-1"
            aria-label="Next week"
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

      {/* Week Grid */}
      <div className="flex-1 min-h-0 overflow-hidden">
        <DndContext
          sensors={sensors}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="h-full lg:grid lg:grid-cols-7 flex overflow-x-auto snap-x snap-mandatory scroll-smooth">
            {days.map((day) => (
              <DayColumn
                key={day.toISOString()}
                date={day}
                tasks={getTasksForDate(day)}
                onTaskEdit={onTaskEdit}
                onTaskToggle={onTaskToggle}
                onTaskDelete={onTaskDelete}
                onAddTask={onAddTask}
                showDatesOnTasks={isSearching}
              />
            ))}
          </div>

          <DragOverlay>
            {activeTask ? (
              <div className="w-64">
                <TaskCard
                  task={activeTask}
                  onEdit={() => {}}
                  onToggle={() => {}}
                  onDelete={() => {}}
                />
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>
    </div>
  )
}
