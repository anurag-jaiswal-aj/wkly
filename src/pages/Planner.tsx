import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useTasks } from '@/hooks/useTasks'
import { useTheme } from '@/hooks/useTheme'
import { Task } from '@/types'
import WeekView from '@/components/WeekView'
import TaskModal from '@/components/TaskModal'
import TaskCard from '@/components/TaskCard'
import { motion } from 'framer-motion'

export default function Planner() {
  const { user, signOut } = useAuth()
  const [weekStart, setWeekStart] = useState(new Date())
  const [searchQuery, setSearchQuery] = useState('')
  const { tasks, loading, createTask, updateTask, deleteTask, toggleTaskComplete, reorderTasks } = useTasks(weekStart, searchQuery)
  const { isDark, toggleTheme } = useTheme()

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [defaultDate, setDefaultDate] = useState<string>('')

  const handleTaskEdit = (task: Task) => {
    // If searching, jump to the week containing this task
    if (searchQuery) {
      const taskDate = new Date(task.date)
      setWeekStart(taskDate)
      setSearchQuery('') // Clear search after jumping
    }
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

  const filteredTasks = searchQuery
    ? tasks.filter(task =>
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.description?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : tasks

  const weekStats = {
    total: filteredTasks.length,
    completed: filteredTasks.filter(t => t.completed).length,
    pending: filteredTasks.filter(t => !t.completed).length,
    highPriority: filteredTasks.filter(t => t.priority === 'high').length,
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
        className="border-b border-gray-200 dark:border-gray-800 px-6 py-4"
      >
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-light tracking-tight">Wkly</h1>

          <div className="flex items-center gap-4">
            <div className="text-sm text-gray-500">
              {user?.email}
            </div>

            <button
              onClick={toggleTheme}
              className="text-gray-500 hover:text-black dark:hover:text-white text-sm transition-colors"
              title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {isDark ? '☀' : '☾'}
            </button>

            <button
              onClick={handleSignOut}
              className="text-sm text-gray-500 hover:text-black dark:hover:text-white transition-colors"
            >
              Sign out
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between gap-4">
          <div className="flex-1 max-w-md">
            <input
              type="text"
              placeholder="Search tasks across all weeks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 text-sm border border-gray-300 dark:border-gray-700 
                         rounded-lg bg-white dark:bg-gray-900 
                         focus:outline-none focus:ring-2 focus:ring-gray-400 dark:focus:ring-gray-600
                         transition-all"
            />
          </div>

          <div className="flex items-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-gray-500">Total:</span>
              <span className="font-medium">{weekStats.total}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-500">Done:</span>
              <span className="font-medium">{weekStats.completed}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-500">Pending:</span>
              <span className="font-medium">{weekStats.pending}</span>
            </div>
            {weekStats.highPriority > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-gray-500">High Priority:</span>
                <span className="font-medium">{weekStats.highPriority}</span>
              </div>
            )}
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden">
        {searchQuery ? (
          <div className="h-full overflow-y-auto p-6">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-lg font-light mb-4 text-gray-600 dark:text-gray-400">
                Found {filteredTasks.length} {filteredTasks.length === 1 ? 'task' : 'tasks'}
              </h2>
              <div className="space-y-2">
                {filteredTasks.length === 0 ? (
                  <div className="text-center py-12 text-gray-400">
                    <div className="mb-2 text-4xl">🔍</div>
                    <p>No tasks found matching "{searchQuery}"</p>
                  </div>
                ) : (
                  filteredTasks.map((task) => (
                    <div key={task.id} className="max-w-2xl">
                      <TaskCard
                        task={task}
                        onEdit={handleTaskEdit}
                        onToggle={toggleTaskComplete}
                        onDelete={deleteTask}
                        showDate={true}
                      />
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        ) : (
          <WeekView
            weekStart={weekStart}
            tasks={filteredTasks}
            onTaskEdit={handleTaskEdit}
            onTaskToggle={toggleTaskComplete}
            onTaskDelete={deleteTask}
            onTaskReorder={reorderTasks}
            onAddTask={handleAddTask}
            onWeekChange={setWeekStart}
            isSearching={false}
          />
        )}
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
