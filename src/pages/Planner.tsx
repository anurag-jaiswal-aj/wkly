import { useState, useRef, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useTasks } from '@/hooks/useTasks'
import { useTheme } from '@/hooks/useTheme'
import { Task, Subtask } from '@/types'
import WeekView from '@/components/WeekView'
import TaskModal from '@/components/TaskModal'
import TaskCard from '@/components/TaskCard'
import StatsPanel from '@/components/StatsPanel'
import FocusMode from '@/components/FocusMode'
import KeyboardShortcutsModal from '@/components/KeyboardShortcutsModal'
import { motion } from 'framer-motion'
import { isToday, parseISO, startOfWeek } from 'date-fns'
import { supabase } from '@/lib/supabase'

export default function Planner() {
  const { user, signOut } = useAuth()
  const [weekStart, setWeekStart] = useState(new Date())
  const [searchQuery, setSearchQuery] = useState('')
  const { tasks, loading, createTask, updateTask, deleteTask, toggleTaskComplete, reorderTasks } = useTasks(weekStart, searchQuery)
  const { isDark, toggleTheme } = useTheme()

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [defaultDate, setDefaultDate] = useState<string>('')
  const [filterPriority, setFilterPriority] = useState<'all' | 'low' | 'medium' | 'high'>('all')
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'completed'>('all')
  const [showCompleted, setShowCompleted] = useState(true)
  const [showTodayOnly, setShowTodayOnly] = useState(false)
  const [statsOpen, setStatsOpen] = useState(false)
  const [focusMode, setFocusMode] = useState(false)
  const [taskSubtasks, setTaskSubtasks] = useState<Subtask[]>([])
  const [showShortcuts, setShowShortcuts] = useState(false)
  const searchInputRef = useRef<HTMLInputElement>(null)

  const handleTaskEdit = async (task: Task) => {
    // If searching, jump to the week containing this task
    if (searchQuery) {
      const taskDate = new Date(task.date)
      setWeekStart(taskDate)
      setSearchQuery('') // Clear search after jumping
    }
    
    // Fetch subtasks for this task
    const { data } = await supabase
      .from('subtasks')
      .select('*')
      .eq('task_id', task.id)
      .order('order_index')
    
    setTaskSubtasks(data || [])
    setEditingTask(task)
    setIsModalOpen(true)
  }

  const handleAddTask = (date: string) => {
    setEditingTask(null)
    setDefaultDate(date)
    setTaskSubtasks([])
    setIsModalOpen(true)
  }

  const goToToday = () => {
    setWeekStart(startOfWeek(new Date(), { weekStartsOn: 1 }))
  }

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in input fields
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        // Allow Escape and Ctrl shortcuts even in inputs
        if (e.key !== 'Escape' && !(e.ctrlKey || e.metaKey)) {
          return
        }
      }

      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0
      const cmdOrCtrl = isMac ? e.metaKey : e.ctrlKey

      // Ctrl/Cmd + N: New task
      if (cmdOrCtrl && e.key === 'n') {
        e.preventDefault()
        handleAddTask(new Date().toISOString().split('T')[0])
      }
      // Ctrl/Cmd + K or /: Focus search
      else if ((cmdOrCtrl && e.key === 'k') || e.key === '/') {
        e.preventDefault()
        searchInputRef.current?.focus()
      }
      // Ctrl/Cmd + F: Toggle focus mode
      else if (cmdOrCtrl && e.key === 'f') {
        e.preventDefault()
        setFocusMode(!focusMode)
      }
      // Ctrl/Cmd + S: Toggle stats
      else if (cmdOrCtrl && e.key === 's') {
        e.preventDefault()
        setStatsOpen(!statsOpen)
      }
      // Ctrl/Cmd + D: Toggle dark mode
      else if (cmdOrCtrl && e.key === 'd') {
        e.preventDefault()
        toggleTheme()
      }
      // Ctrl/Cmd + T: Go to today
      else if (cmdOrCtrl && e.key === 't') {
        e.preventDefault()
        goToToday()
      }
      // Ctrl/Cmd + Arrow: Navigate weeks
      else if (cmdOrCtrl && e.key === 'ArrowLeft') {
        e.preventDefault()
        const newDate = new Date(weekStart)
        newDate.setDate(newDate.getDate() - 7)
        setWeekStart(newDate)
      }
      else if (cmdOrCtrl && e.key === 'ArrowRight') {
        e.preventDefault()
        const newDate = new Date(weekStart)
        newDate.setDate(newDate.getDate() + 7)
        setWeekStart(newDate)
      }
      // Escape: Close modals
      else if (e.key === 'Escape') {
        if (showShortcuts) {
          setShowShortcuts(false)
        } else if (focusMode) {
          setFocusMode(false)
        } else if (isModalOpen) {
          setIsModalOpen(false)
          setEditingTask(null)
        }
      }
      // ?: Show shortcuts
      else if (e.key === '?' && e.shiftKey) {
        e.preventDefault()
        setShowShortcuts(true)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [focusMode, isModalOpen, showShortcuts, statsOpen, weekStart, toggleTheme])

  const handleSaveTask = async (taskData: Partial<Task>, subtasks: Partial<Subtask>[] = []) => {
    if (editingTask) {
      await updateTask(editingTask.id, taskData)
      
      // Handle subtasks
      // Delete removed subtasks
      const existingIds = taskSubtasks.map(st => st.id)
      const newIds = subtasks.filter(st => st.id).map(st => st.id)
      const toDelete = existingIds.filter(id => !newIds.includes(id))
      
      for (const id of toDelete) {
        await supabase.from('subtasks').delete().eq('id', id)
      }
      
      // Update or create subtasks
      for (const subtask of subtasks) {
        if (subtask.id) {
          // Update existing
          await supabase
            .from('subtasks')
            .update({
              title: subtask.title,
              completed: subtask.completed,
              order_index: subtask.order_index
            })
            .eq('id', subtask.id)
        } else {
          // Create new
          await supabase
            .from('subtasks')
            .insert([{
              task_id: editingTask.id,
              title: subtask.title,
              completed: subtask.completed || false,
              order_index: subtask.order_index || 0
            }])
        }
      }
    } else {
      const result = await createTask({
        title: taskData.title!,
        description: taskData.description || null,
        date: taskData.date!,
        completed: false,
        order_index: 0,
        reminder_time: null,
        recurrence: taskData.recurrence || null,
        recurrence_parent_id: taskData.recurrence_parent_id || null,
        priority: taskData.priority,
      })
      
      // Create subtasks for new task
      if (result.data && subtasks.length > 0) {
        for (const subtask of subtasks) {
          await supabase
            .from('subtasks')
            .insert([{
              task_id: result.data.id,
              title: subtask.title,
              completed: subtask.completed || false,
              order_index: subtask.order_index || 0
            }])
        }
      }
    }
    setEditingTask(null)
    setDefaultDate('')
    setTaskSubtasks([])
  }

  const handleSignOut = async () => {
    if (confirm('Are you sure you want to sign out?')) {
      await signOut()
    }
  }

  const applyFilters = (taskList: Task[]) => {
    let filtered = taskList

    // Filter by completion status
    if (!showCompleted) {
      filtered = filtered.filter(t => !t.completed)
    }
    if (filterStatus === 'completed') {
      filtered = filtered.filter(t => t.completed)
    } else if (filterStatus === 'pending') {
      filtered = filtered.filter(t => !t.completed)
    }

    // Filter by priority
    if (filterPriority !== 'all') {
      filtered = filtered.filter(t => t.priority === filterPriority)
    }

    // Filter by today
    if (showTodayOnly) {
      filtered = filtered.filter(t => isToday(parseISO(t.date)))
    }

    return filtered
  }

  const filteredTasks = applyFilters(
    searchQuery
      ? tasks.filter(task =>
          task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          task.description?.toLowerCase().includes(searchQuery.toLowerCase())
        )
      : tasks
  )

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
              className="text-gray-500 hover:text-black dark:hover:text-white transition-colors"
              title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              <span className="material-symbols-outlined text-xl">{isDark ? 'light_mode' : 'dark_mode'}</span>
            </button>

            <button
              onClick={() => setFocusMode(true)}
              className="px-3 py-1.5 rounded bg-gray-100 dark:bg-gray-900 hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors text-sm flex items-center gap-1"
              title="Focus Mode - Today's tasks with Pomodoro timer (Ctrl+F)"
            >
              <span className="material-symbols-outlined text-base">target</span>
              Focus
            </button>

            <button
              onClick={() => setShowShortcuts(true)}
              className="text-gray-500 hover:text-black dark:hover:text-white transition-colors"
              title="Keyboard shortcuts (?)"
            >
              <span className="material-symbols-outlined text-xl">keyboard</span>
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
              ref={searchInputRef}
              type="text"
              placeholder="Search tasks across all weeks... (Ctrl+K or /)"
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

        {/* Filters Bar */}
        <div className="flex items-center gap-3 mt-4 pt-4 border-t border-gray-200 dark:border-gray-800">
          <span className="text-xs text-gray-500 font-medium uppercase tracking-wider">Filters:</span>
          
          {/* Priority Filter */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => setFilterPriority('all')}
              className={`px-3 py-1 text-xs rounded transition-all ${
                filterPriority === 'all'
                  ? 'bg-gray-900 dark:bg-gray-100 text-white dark:text-black'
                  : 'bg-gray-100 dark:bg-gray-900 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilterPriority('high')}
              className={`px-3 py-1 text-xs rounded transition-all ${
                filterPriority === 'high'
                  ? 'bg-gray-900 dark:bg-gray-100 text-white dark:text-black'
                  : 'bg-gray-100 dark:bg-gray-900 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800'
              }`}
            >
              !!! High
            </button>
            <button
              onClick={() => setFilterPriority('medium')}
              className={`px-3 py-1 text-xs rounded transition-all ${
                filterPriority === 'medium'
                  ? 'bg-gray-700 dark:bg-gray-300 text-white dark:text-black'
                  : 'bg-gray-100 dark:bg-gray-900 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800'
              }`}
            >
              !! Medium
            </button>
            <button
              onClick={() => setFilterPriority('low')}
              className={`px-3 py-1 text-xs rounded transition-all ${
                filterPriority === 'low'
                  ? 'bg-gray-500 dark:bg-gray-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-900 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800'
              }`}
            >
              ! Low
            </button>
          </div>

          <div className="h-4 w-px bg-gray-300 dark:bg-gray-700"></div>

          {/* Status Filter */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-3 py-1 text-xs rounded transition-all ${
                filterStatus === 'all'
                  ? 'bg-gray-900 dark:bg-gray-100 text-white dark:text-black'
                  : 'bg-gray-100 dark:bg-gray-900 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilterStatus('pending')}
              className={`px-3 py-1 text-xs rounded transition-all ${
                filterStatus === 'pending'
                  ? 'bg-gray-900 dark:bg-gray-100 text-white dark:text-black'
                  : 'bg-gray-100 dark:bg-gray-900 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800'
              }`}
            >
              Pending
            </button>
            <button
              onClick={() => setFilterStatus('completed')}
              className={`px-3 py-1 text-xs rounded transition-all ${
                filterStatus === 'completed'
                  ? 'bg-gray-900 dark:bg-gray-100 text-white dark:text-black'
                  : 'bg-gray-100 dark:bg-gray-900 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800'
              }`}
            >
              Completed
            </button>
          </div>

          <div className="h-4 w-px bg-gray-300 dark:bg-gray-700"></div>

          {/* Quick Toggles */}
          <button
            onClick={() => setShowTodayOnly(!showTodayOnly)}
            className={`px-3 py-1 text-xs rounded transition-all ${
              showTodayOnly
                ? 'bg-gray-900 dark:bg-gray-100 text-white dark:text-black'
                : 'bg-gray-100 dark:bg-gray-900 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800'
            }`}
          >
            Today Only
          </button>

          <button
            onClick={() => setShowCompleted(!showCompleted)}
            className={`px-3 py-1 text-xs rounded transition-all ${
              !showCompleted
                ? 'bg-gray-900 dark:bg-gray-100 text-white dark:text-black'
                : 'bg-gray-100 dark:bg-gray-900 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800'
            }`}
          >
            {showCompleted ? 'Hide Completed' : 'Show Completed'}
          </button>

          {/* Clear Filters */}
          {(filterPriority !== 'all' || filterStatus !== 'all' || showTodayOnly || !showCompleted) && (
            <>
              <div className="h-4 w-px bg-gray-300 dark:bg-gray-700"></div>
              <button
                onClick={() => {
                  setFilterPriority('all')
                  setFilterStatus('all')
                  setShowTodayOnly(false)
                  setShowCompleted(true)
                }}
                className="px-3 py-1 text-xs text-gray-500 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
              >
                Clear all
              </button>
            </>
          )}
        </div>
      </motion.header>

      {/* Stats Panel */}
      <StatsPanel 
        tasks={tasks}
        weekStart={weekStart}
        isOpen={statsOpen}
        onToggle={() => setStatsOpen(!statsOpen)}
      />

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
                    <div className="mb-2 text-2xl font-light">No Results</div>
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
        existingSubtasks={taskSubtasks}
      />

      {/* Focus Mode */}
      {focusMode && (
        <FocusMode
          tasks={tasks}
          onClose={() => setFocusMode(false)}
          onToggle={toggleTaskComplete}
          onEdit={handleTaskEdit}
        />
      )}

      {/* Keyboard Shortcuts Modal */}
      <KeyboardShortcutsModal
        isOpen={showShortcuts}
        onClose={() => setShowShortcuts(false)}
      />
    </div>
  )
}
