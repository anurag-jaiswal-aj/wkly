import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useTasks } from '@/hooks/useTasks'
import { useTheme } from '@/hooks/useTheme'
import { Task } from '@/types'
import WeekView from '@/components/WeekView'
import TaskModal from '@/components/TaskModal'
import { motion } from 'framer-motion'

export default function Planner() {
  const { user, signOut } = useAuth()
  const [weekStart, setWeekStart] = useState(new Date())
  const { tasks, loading, createTask, updateTask, deleteTask, toggleTaskComplete, reorderTasks } = useTasks(weekStart)
  const { isDark, toggleTheme } = useTheme()

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [defaultDate, setDefaultDate] = useState<string>('')

  const handleTaskEdit = (task: Task) => {
    setEditingTask(task)
    setIsModalOpen(true)
  }

  const handleAddTask = (date: string) => {
    setEditingTask(null)
    setDefaultDate(date)
    setIsModalOpen(true)
  }

  const handleSaveTask = async (taskData: Partial<Task>) => {
    if (editingTask) {
      await updateTask(editingTask.id, taskData)
    } else {
      await createTask({
        title: taskData.title!,
        description: taskData.description || null,
        date: taskData.date!,
        completed: false,
        order_index: 0,
        reminder_time: null,
        recurrence: null,
      })
    }
    setEditingTask(null)
    setDefaultDate('')
  }

  const handleSignOut = async () => {
    await signOut()
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col">
      {/* Top Nav */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="border-b border-gray-200 dark:border-gray-800 px-6 py-4 flex items-center justify-between"
      >
        <h1 className="text-2xl font-light tracking-tight">Wkly</h1>

        <div className="flex items-center gap-4">
          <div className="text-sm text-gray-500">
            {user?.email}
          </div>

          <button
            onClick={toggleTheme}
            className="text-gray-500 hover:text-black dark:hover:text-white text-sm"
            title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {isDark ? '☀' : '☾'}
          </button>

          <button
            onClick={handleSignOut}
            className="text-sm text-gray-500 hover:text-black dark:hover:text-white"
          >
            Sign out
          </button>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden">
        <WeekView
          weekStart={weekStart}
          tasks={tasks}
          onTaskEdit={handleTaskEdit}
          onTaskToggle={toggleTaskComplete}
          onTaskDelete={deleteTask}
          onTaskReorder={reorderTasks}
          onAddTask={handleAddTask}
          onWeekChange={setWeekStart}
        />
      </main>

      {/* Task Modal */}
      <TaskModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setEditingTask(null)
          setDefaultDate('')
        }}
        onSave={handleSaveTask}
        task={editingTask}
        defaultDate={defaultDate}
      />
    </div>
  )
}
