import { useState, useRef, useEffect, lazy, Suspense, useMemo, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { useTasks } from '@/hooks/useTasks'
import { useTags } from '@/hooks/useTags'
import { useTheme } from '@/hooks/useTheme'
import { useToast } from '@/contexts/ToastContext'
import { useDebounce } from '@/hooks/useDebounce'
import { useOfflineQueue } from '@/hooks/useOfflineQueue'
import { Task, Subtask, Tag } from '@/types'
import WeekView from '@/components/WeekView'
import MonthView from '@/components/MonthView'
import DayView from '@/components/DayView'
import TaskCard from '@/components/TaskCard'
import NetworkStatus from '@/components/NetworkStatus'
import LoadingSpinner from '@/components/LoadingSpinner'
import OnboardingTour from '@/components/OnboardingTour'
import QuickAddTask from '@/components/QuickAddTask'
import { motion } from 'framer-motion'
import { isToday, parseISO, startOfWeek } from 'date-fns'
import { supabase } from '@/lib/supabase'

// Lazy load heavy components
const TaskModal = lazy(() => import('@/components/TaskModal'))
const StatsPanel = lazy(() => import('@/components/StatsPanel'))
const FocusMode = lazy(() => import('@/components/FocusMode'))
const KeyboardShortcutsModal = lazy(() => import('@/components/KeyboardShortcutsModal'))
const ConfirmDialog = lazy(() => import('@/components/ConfirmDialog'))

export default function Planner() {
  const { user, signOut } = useAuth()
  const toast = useToast()
  const [weekStart, setWeekStart] = useState(new Date())
  const [searchQuery, setSearchQuery] = useState('')
  
  // Debounce search query for better performance
  const debouncedSearchQuery = useDebounce(searchQuery, 200)
  
  // Offline queue management
  const { isOnline, queueCount, isSyncing } = useOfflineQueue()
  
  const { tasks, loading, createTask, updateTask, deleteTask, toggleTaskComplete, reorderTasks, refetch } = useTasks(
    weekStart, 
    debouncedSearchQuery,
    (error) => toast.showError(error)
  )
  const { isDark, toggleTheme } = useTheme()
  const { tags: allTags } = useTags()

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [defaultDate, setDefaultDate] = useState<string>('')
  const [filterPriority, setFilterPriority] = useState<'all' | 'low' | 'medium' | 'high'>('all')
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'completed'>('all')
  const [filterTag, setFilterTag] = useState<string | null>(null)
  const [showCompleted, setShowCompleted] = useState(true)
  const [showTodayOnly, setShowTodayOnly] = useState(false)
  const [statsOpen, setStatsOpen] = useState(false)
  const [focusMode, setFocusMode] = useState(false)
  const [taskSubtasks, setTaskSubtasks] = useState<Subtask[]>([])
  const [showShortcuts, setShowShortcuts] = useState(false)
  const [showSignOutConfirm, setShowSignOutConfirm] = useState(false)
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [viewMode, setViewMode] = useState<'week' | 'month' | 'day'>('week')
  const searchInputRef = useRef<HTMLInputElement>(null)

  // Check if user needs onboarding
  useEffect(() => {
    const hasSeenOnboarding = localStorage.getItem('hasSeenOnboarding')
    if (!hasSeenOnboarding) {
      setShowOnboarding(true)
    }
  }, [])

  // Memoize callbacks to prevent unnecessary re-renders
  const handleTaskEdit = useCallback(async (task: Task) => {
    // If searching, jump to the week containing this task
    if (debouncedSearchQuery) {
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
  }, [debouncedSearchQuery])

  const handleAddTask = useCallback((date: string, time?: string) => {
    // consume `time` to avoid unused-var lint complaints; may be used in future
    void time
    setEditingTask(null)
    setDefaultDate(date)
    setTaskSubtasks([])
    setIsModalOpen(true)
    // If time is provided, we could store it to pre-fill the modal
    // For now, the time will be set via natural language or manual selection
  }, [])

  const goToToday = useCallback(() => {
    setWeekStart(startOfWeek(new Date(), { weekStartsOn: 1 }))
  }, [])

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
  }, [focusMode, isModalOpen, showShortcuts, statsOpen, weekStart, toggleTheme, handleAddTask, goToToday])

  const handleSaveTask = async (taskData: Partial<Task>, subtasks: Partial<Subtask>[] = [], tags: Tag[] = []) => {
    try {
      if (editingTask) {
        const result = await updateTask(editingTask.id, taskData)
        
        if (result.error) {
          toast.showError('Failed to update task')
          return
        }
        
        // Handle subtasks
        // Delete removed subtasks
        const existingIds = taskSubtasks.map(st => st.id)
        const newIds = subtasks.filter(st => st.id).map(st => st.id)
        const toDelete = existingIds.filter(id => !newIds.includes(id))
        
        if (toDelete.length > 0) {
          const { error: delError } = await supabase.from('subtasks').delete().in('id', toDelete)
          if (delError) throw delError
        }
        
        // Update or create subtasks in bulk if possible
        const toUpdate = subtasks.filter(st => st.id).map(st => ({
          id: st.id,
          task_id: editingTask.id,
          title: st.title,
          completed: st.completed,
          order_index: st.order_index
        }))

        const toInsert = subtasks.filter(st => !st.id).map(st => ({
          task_id: editingTask.id,
          title: st.title,
          completed: st.completed || false,
          order_index: st.order_index || 0
        }))

        if (toUpdate.length > 0) {
          const { error: updateError } = await supabase.from('subtasks').upsert(toUpdate)
          if (updateError) throw updateError
        }

        if (toInsert.length > 0) {
          const { error: insertError } = await supabase.from('subtasks').insert(toInsert)
          if (insertError) throw insertError
        }
        
        // Handle tags - delete all and recreate
        const { error: tagDelError } = await supabase.from('task_tags').delete().eq('task_id', editingTask.id)
        if (tagDelError) throw tagDelError

        if (tags.length > 0) {
          const { error: tagInsError } = await supabase.from('task_tags').insert(
            tags.map(tag => ({ task_id: editingTask.id, tag_id: tag.id }))
          )
          if (tagInsError) throw tagInsError
        }
        
        toast.showSuccess('Task updated successfully')
        refetch({ background: true })
      } else {
        // Only include defined fields to handle missing database columns gracefully
        const taskToCreate: Record<string, unknown> = {
          title: taskData.title!,
          description: taskData.description || null,
          date: taskData.date!,
          completed: false,
          order_index: 0,
        }
        
        // Only add optional fields if they have values
        if (taskData.recurrence) taskToCreate.recurrence = taskData.recurrence
        if (taskData.recurrence_parent_id) taskToCreate.recurrence_parent_id = taskData.recurrence_parent_id
        if (taskData.priority) taskToCreate.priority = taskData.priority
        if (taskData.reminder_time) taskToCreate.reminder_time = taskData.reminder_time
        
        const result = await createTask(taskToCreate as Omit<Task, 'id' | 'user_id' | 'created_at'>)
        
        if (result.error) {
          toast.showError('Failed to create task')
          return
        }
        
        // Create subtasks for new task
        if (result.data && subtasks.length > 0) {
          const toInsert = subtasks.map(st => ({
            task_id: result.data.id,
            title: st.title,
            completed: st.completed || false,
            order_index: st.order_index || 0
          }))
          const { error: subtaskError } = await supabase.from('subtasks').insert(toInsert)
          if (subtaskError) throw subtaskError
        }
        
        // Create task tags
        if (result.data && tags.length > 0) {
          const { error: tagError } = await supabase.from('task_tags').insert(
            tags.map(tag => ({ task_id: result.data.id, tag_id: tag.id }))
          )
          if (tagError) throw tagError
        }
        
        toast.showSuccess('Task created successfully')
        refetch({ background: true })
      }
      setEditingTask(null)
      setDefaultDate('')
      setTaskSubtasks([])
    } catch (error) {
      console.error('Error saving task:', error)
      toast.showError('An unexpected error occurred')
    }
  }

  const handleSignOut = async () => {
    setShowSignOutConfirm(true)
  }

  const confirmSignOut = useCallback(async () => {
    const { error } = await signOut()
    if (error) {
      toast.showError('Failed to sign out. Please try again.')
    }
    setShowSignOutConfirm(false)
  }, [signOut, toast])

  // Memoize filter function to avoid recreating on every render
  const applyFilters = useCallback((taskList: Task[]) => {
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

    // Filter by tag
    if (filterTag) {
      filtered = filtered.filter(t => t.tags?.some(tag => tag.id === filterTag))
    }

    // Filter by today
    if (showTodayOnly) {
      filtered = filtered.filter(t => isToday(parseISO(t.date)))
    }

    return filtered
  }, [showCompleted, filterStatus, filterPriority, filterTag, showTodayOnly])

  // Memoize filtered tasks to avoid recomputing on every render
  const filteredTasks = useMemo(() => {
    const searchFiltered = searchQuery
      ? tasks.filter(task =>
          task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          task.description?.toLowerCase().includes(searchQuery.toLowerCase())
        )
      : tasks
    
    return applyFilters(searchFiltered)
  }, [tasks, searchQuery, applyFilters])

  // Memoize week stats to avoid recalculating on every render
  const weekStats = useMemo(() => ({
    total: filteredTasks.length,
    completed: filteredTasks.filter(t => t.completed).length,
    pending: filteredTasks.filter(t => !t.completed).length,
    highPriority: filteredTasks.filter(t => t.priority === 'high').length,
  }), [filteredTasks])

  if (loading) {
    return <LoadingSpinner fullScreen />
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      {/* Skip link for keyboard navigation */}
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>
      
      <NetworkStatus />
      
      {/* Top Nav */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="border-b border-gray-200 dark:border-gray-800 px-4 md:px-6 py-3 md:py-4 flex-shrink-0"
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0 mb-3 md:mb-4">
          <h1 className="text-xl md:text-2xl font-light tracking-tight">Wkly</h1>

          <div className="flex items-center gap-2 md:gap-4 text-xs md:text-sm">
            <div className="text-gray-500 truncate max-w-[150px] sm:max-w-none">
              {user?.email}
            </div>

            {/* View Toggle */}
            <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-900 rounded p-1">
              <button
                onClick={() => setViewMode('day')}
                className={`px-2 py-1 text-xs rounded transition-colors ${
                  viewMode === 'day'
                    ? 'bg-white dark:bg-black shadow-sm'
                    : 'text-gray-500 hover:text-gray-900 dark:hover:text-gray-100'
                }`}
                aria-label="Day view"
                title="Day view"
              >
                <span className="material-symbols-outlined text-sm">today</span>
              </button>
              <button
                onClick={() => setViewMode('week')}
                className={`px-2 py-1 text-xs rounded transition-colors ${
                  viewMode === 'week'
                    ? 'bg-white dark:bg-black shadow-sm'
                    : 'text-gray-500 hover:text-gray-900 dark:hover:text-gray-100'
                }`}
                aria-label="Week view"
                title="Week view"
              >
                <span className="material-symbols-outlined text-sm">view_week</span>
              </button>
              <button
                onClick={() => setViewMode('month')}
                className={`px-2 py-1 text-xs rounded transition-colors ${
                  viewMode === 'month'
                    ? 'bg-white dark:bg-black shadow-sm'
                    : 'text-gray-500 hover:text-gray-900 dark:hover:text-gray-100'
                }`}
                aria-label="Month view"
                title="Month view"
              >
                <span className="material-symbols-outlined text-sm">calendar_month</span>
              </button>
            </div>

            <button
              onClick={toggleTheme}
              aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
              className="text-gray-500 hover:text-black dark:hover:text-white transition-colors"
              title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
              data-tour="theme-toggle"
            >
              <span className="material-symbols-outlined text-xl" aria-hidden="true">{isDark ? 'light_mode' : 'dark_mode'}</span>
            </button>

            <button
              onClick={() => setStatsOpen(!statsOpen)}
              aria-label="View weekly statistics"
              className="text-gray-500 hover:text-black dark:hover:text-white transition-colors"
              title="Weekly stats (Ctrl+S)"
              data-tour="stats"
            >
              <span className="material-symbols-outlined text-xl" aria-hidden="true">bar_chart</span>
            </button>

            <button
              onClick={() => setFocusMode(true)}
              aria-label="Enter focus mode"
              className="text-gray-500 hover:text-black dark:hover:text-white transition-colors"
              title="Focus Mode (Ctrl+F)"
              data-tour="focus-mode"
            >
              <span className="material-symbols-outlined text-xl" aria-hidden="true">target</span>
            </button>

            <button
              onClick={() => setShowShortcuts(true)}
              aria-label="View keyboard shortcuts"
              className="text-gray-500 hover:text-black dark:hover:text-white transition-colors"
              title="Keyboard shortcuts (?)"
              data-tour="shortcuts"
            >
              <span className="material-symbols-outlined text-xl" aria-hidden="true">keyboard</span>
            </button>

            <button
              onClick={() => setShowOnboarding(true)}
              aria-label="Show tour"
              className="text-gray-500 hover:text-black dark:hover:text-white transition-colors"
              title="Show tour"
              data-tour="tour-button"
            >
              <span className="material-symbols-outlined text-xl" aria-hidden="true">help</span>
            </button>

            <Link
              to="/settings"
              aria-label="Account Settings"
              className="text-gray-500 hover:text-black dark:hover:text-white transition-colors"
              title="Settings"
            >
              <span className="material-symbols-outlined text-xl" aria-hidden="true">settings</span>
            </Link>

            <button
              onClick={handleSignOut}
              aria-label="Sign out"
              className="text-gray-500 hover:text-black dark:hover:text-white transition-colors"
              title="Sign out"
            >
              <span className="material-symbols-outlined text-xl" aria-hidden="true">logout</span>
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between gap-4">
          <div className="flex-1 max-w-2xl" data-tour="quick-add">
            <QuickAddTask 
              onCreateTask={async (parsed) => {
                // Convert time string to full ISO timestamp if provided
                let reminderTime = null
                if (parsed.time) {
                  // Combine date and time into ISO timestamp with timezone
                  // Format: YYYY-MM-DDTHH:mm:ss+00:00
                  reminderTime = `${parsed.date}T${parsed.time}:00Z`
                }
                
                const result = await createTask({
                  title: parsed.title,
                  description: parsed.description || null,
                  date: parsed.date,
                  completed: false,
                  order_index: 0,
                  reminder_time: reminderTime,
                  recurrence: null,
                  recurrence_parent_id: null,
                  priority: parsed.priority || 'medium',
                })
                
                if (result.error) {
                  toast.showError('Failed to create task')
                } else {
                  toast.showSuccess('Task created successfully')
                }
              }}
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setFilterPriority('all')
                setFilterStatus('all')
                setFilterTag(null)
                setShowTodayOnly(false)
                setShowCompleted(true)
                setSearchQuery('')
              }}
              aria-label="Clear all filters"
              className="px-3 py-1.5 text-xs text-gray-500 hover:text-gray-900 dark:hover:text-gray-100 
                       hover:bg-gray-100 dark:hover:bg-gray-900 rounded transition-colors"
              title="Clear all filters"
            >
              Clear filters
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="mt-3">
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Search tasks... (Ctrl+K or /)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label="Search tasks"
            className="w-full px-4 py-2 text-sm border border-gray-300 dark:border-gray-700 
                       rounded-lg bg-white dark:bg-gray-900 
                       focus:outline-none focus:ring-2 focus:ring-gray-400 dark:focus:ring-gray-600
                       transition-all"
            data-tour="search"
          />
        </div>

        {/* Quick Filters */}
        <div className="flex items-center justify-between gap-3 mt-4 pt-4 border-t border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-2" data-tour="filters">
            <button
              onClick={() => setFilterPriority(filterPriority === 'high' ? 'all' : 'high')}
              aria-label={filterPriority === 'high' ? 'Show all priorities' : 'Show only high priority tasks'}
              aria-pressed={filterPriority === 'high'}
              className={`px-3 py-1.5 text-xs rounded transition-all flex items-center gap-1 ${
                filterPriority === 'high'
                  ? 'bg-gray-900 dark:bg-gray-100 text-white dark:text-black'
                  : 'bg-gray-100 dark:bg-gray-900 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800'
              }`}
            >
              !!! High Priority
            </button>
            <button
              onClick={() => setShowTodayOnly(!showTodayOnly)}
              aria-label={showTodayOnly ? 'Show all days' : 'Show only today'}
              aria-pressed={showTodayOnly}
              className={`px-3 py-1.5 text-xs rounded transition-all ${
                showTodayOnly
                  ? 'bg-gray-900 dark:bg-gray-100 text-white dark:text-black'
                  : 'bg-gray-100 dark:bg-gray-900 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800'
              }`}
            >
              Today Only
            </button>
            <button
              onClick={() => setShowCompleted(!showCompleted)}
              aria-label={showCompleted ? 'Hide completed tasks' : 'Show completed tasks'}
              aria-pressed={!showCompleted}
              className={`px-3 py-1.5 text-xs rounded transition-all ${
                !showCompleted
                  ? 'bg-gray-900 dark:bg-gray-100 text-white dark:text-black'
                  : 'bg-gray-100 dark:bg-gray-900 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800'
              }`}
            >
              {showCompleted ? 'Hide Completed' : 'Show Completed'}
            </button>
            
            {/* Tag Filter */}
            {allTags.length > 0 && (
              <select
                value={filterTag || ''}
                onChange={(e) => setFilterTag(e.target.value || null)}
                className="px-3 py-1.5 text-xs rounded bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-700
                         text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800 transition-all"
                aria-label="Filter by tag"
              >
                <option value="">All Tags</option>
                {allTags.map(tag => (
                  <option key={tag.id} value={tag.id}>
                    {tag.name}
                  </option>
                ))}
              </select>
            )}
          </div>
          
          <div className="text-xs text-gray-500">
            {weekStats.total} tasks · {weekStats.completed} done · {weekStats.pending} pending
          </div>
        </div>
      </motion.header>

      {/* Stats Panel */}
      <Suspense fallback={null}>
        <StatsPanel 
          tasks={tasks}
          weekStart={weekStart}
          isOpen={statsOpen}
          onToggle={() => setStatsOpen(!statsOpen)}
        />
      </Suspense>

      {/* Main Content */}
      <main id="main-content" className="flex-1 min-h-0 overflow-hidden" role="main" aria-label="Task planner">
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
        ) : viewMode === 'day' ? (
          <DayView
            currentDate={weekStart}
            tasks={filteredTasks}
            onDateChange={setWeekStart}
            onTaskEdit={handleTaskEdit}
            onTaskToggle={toggleTaskComplete}
            onTaskDelete={deleteTask}
            onTaskReorder={reorderTasks}
            onAddTask={handleAddTask}
          />
        ) : viewMode === 'week' ? (
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
        ) : (
          <MonthView
            currentDate={weekStart}
            tasks={filteredTasks}
            onDateChange={setWeekStart}
            onTaskEdit={handleTaskEdit}
            onTaskToggle={toggleTaskComplete}
            onTaskDelete={deleteTask}
            onTaskReorder={reorderTasks}
            onAddTask={handleAddTask}
          />
        )}
      </main>

      {/* Task Modal */}
      <Suspense fallback={null}>
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
      </Suspense>

      {/* Focus Mode */}
      {focusMode && (
        <Suspense fallback={null}>
          <FocusMode
            tasks={tasks}
            onClose={() => setFocusMode(false)}
            onToggle={(taskId) => toggleTaskComplete(taskId, tasks.find(t => t.id === taskId)?.completed || false)}
          />
        </Suspense>
      )}

      {/* Keyboard Shortcuts Modal */}
      <Suspense fallback={null}>
        <KeyboardShortcutsModal
          isOpen={showShortcuts}
          onClose={() => setShowShortcuts(false)}
        />
      </Suspense>

      {/* Sign Out Confirmation */}
      <Suspense fallback={null}>
        <ConfirmDialog
          isOpen={showSignOutConfirm}
          onClose={() => setShowSignOutConfirm(false)}
          onConfirm={confirmSignOut}
          title="Sign Out"
          message="Are you sure you want to sign out?"
          confirmText="Sign Out"
          cancelText="Cancel"
        />
      </Suspense>

      {/* Onboarding Tour */}
      {showOnboarding && (
        <OnboardingTour
          isOpen={showOnboarding}
          onComplete={() => {
            setShowOnboarding(false)
            localStorage.setItem('hasSeenOnboarding', 'true')
          }}
        />
      )}

      {/* Offline Status Banner */}
      {!isOnline && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-black text-white px-4 py-2 rounded-lg shadow-lg z-50 flex items-center gap-2">
          <span className="material-symbols-outlined text-lg">cloud_off</span>
          <span className="text-sm">You're offline. Changes will sync when reconnected.</span>
          {queueCount > 0 && (
            <span className="ml-2 bg-white text-black px-2 py-0.5 rounded-full text-xs font-medium">
              {queueCount} pending
            </span>
          )}
          {isSyncing && (
            <span className="ml-2 text-xs animate-pulse">Syncing...</span>
          )}
        </div>
      )}
    </div>
  )
}
