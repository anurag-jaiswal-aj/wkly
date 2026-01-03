import { Task } from '@/types'
import { motion } from 'framer-motion'
import { 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  format, 
  parseISO, 
  isSameDay,
  startOfDay,
  differenceInDays
} from 'date-fns'

interface StatsPanelProps {
  tasks: Task[]
  weekStart: Date
  isOpen: boolean
  onToggle: () => void
}

export default function StatsPanel({ tasks, weekStart, isOpen, onToggle }: StatsPanelProps) {
  const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 })
  const weekDays = eachDayOfInterval({ 
    start: startOfWeek(weekStart, { weekStartsOn: 1 }), 
    end: weekEnd 
  })

  // Filter tasks for current week
  const weekTasks = tasks.filter(task => {
    const taskDate = parseISO(task.date)
    return taskDate >= startOfWeek(weekStart, { weekStartsOn: 1 }) && taskDate <= weekEnd
  })

  // Weekly completion rate
  const totalWeekTasks = weekTasks.length
  const completedWeekTasks = weekTasks.filter(t => t.completed).length
  const completionRate = totalWeekTasks > 0 ? Math.round((completedWeekTasks / totalWeekTasks) * 100) : 0

  // Average tasks per day
  const avgTasksPerDay = totalWeekTasks > 0 ? (totalWeekTasks / 7).toFixed(1) : '0'

  // Tasks by day for trend
  const tasksByDay = weekDays.map(day => {
    const dayTasks = weekTasks.filter(t => isSameDay(parseISO(t.date), day))
    return {
      date: day,
      total: dayTasks.length,
      completed: dayTasks.filter(t => t.completed).length
    }
  })

  // Calculate streak (consecutive days with completed tasks)
  const calculateStreak = () => {
    let streak = 0
    const today = startOfDay(new Date())
    let currentDate = today

    // Check backwards from today
    while (true) {
      const dayTasks = tasks.filter(t => {
        const taskDate = startOfDay(parseISO(t.date))
        return isSameDay(taskDate, currentDate) && t.completed
      })

      if (dayTasks.length === 0) {
        break
      }

      streak++
      currentDate = new Date(currentDate)
      currentDate.setDate(currentDate.getDate() - 1)

      // Limit to reasonable streak length
      if (streak > 365) break
    }

    return streak
  }

  const streak = calculateStreak()

  // Productivity trend (comparing this week to last week)
  const lastWeekStart = new Date(weekStart)
  lastWeekStart.setDate(lastWeekStart.getDate() - 7)
  const lastWeekEnd = endOfWeek(lastWeekStart, { weekStartsOn: 1 })
  
  const lastWeekTasks = tasks.filter(task => {
    const taskDate = parseISO(task.date)
    return taskDate >= startOfWeek(lastWeekStart, { weekStartsOn: 1 }) && taskDate <= lastWeekEnd
  })
  
  const lastWeekCompleted = lastWeekTasks.filter(t => t.completed).length
  const trend = lastWeekCompleted > 0 
    ? Math.round(((completedWeekTasks - lastWeekCompleted) / lastWeekCompleted) * 100)
    : completedWeekTasks > 0 ? 100 : 0

  return (
    <div className="border-b border-gray-200 dark:border-gray-800">
      <button
        onClick={onToggle}
        className="w-full px-6 py-3 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
      >
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Weekly Stats
        </span>
        <motion.span
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="text-gray-500"
        >
          <span className="material-symbols-outlined text-base">expand_more</span>
        </motion.span>
      </button>

      {isOpen && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="px-6 pb-4 overflow-hidden"
        >
          <div className="grid grid-cols-4 gap-4 mb-4">
            {/* Completion Rate */}
            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 border border-gray-200 dark:border-gray-800">
              <div className="text-xs text-gray-500 mb-1 uppercase tracking-wider">Completion Rate</div>
              <div className="text-3xl font-light mb-1">{completionRate}%</div>
              <div className="text-xs text-gray-500">
                {completedWeekTasks} of {totalWeekTasks} tasks
              </div>
            </div>

            {/* Average per Day */}
            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 border border-gray-200 dark:border-gray-800">
              <div className="text-xs text-gray-500 mb-1 uppercase tracking-wider">Avg per Day</div>
              <div className="text-3xl font-light mb-1">{avgTasksPerDay}</div>
              <div className="text-xs text-gray-500">
                tasks per day
              </div>
            </div>

            {/* Productivity Trend */}
            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 border border-gray-200 dark:border-gray-800">
              <div className="text-xs text-gray-500 mb-1 uppercase tracking-wider">vs Last Week</div>
              <div className="text-3xl font-light mb-1">
                {trend > 0 ? '+' : ''}{trend}%
              </div>
              <div className="text-xs text-gray-500">
                {trend > 0 ? '+ improving' : trend < 0 ? '- declining' : '= stable'}
              </div>
            </div>

            {/* Streak */}
            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 border border-gray-200 dark:border-gray-800">
              <div className="text-xs text-gray-500 mb-1 uppercase tracking-wider">Current Streak</div>
              <div className="text-3xl font-light mb-1">{streak}</div>
              <div className="text-xs text-gray-500">
                {streak === 1 ? 'day' : 'days'}
              </div>
            </div>
          </div>

          {/* Daily Breakdown */}
          <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 border border-gray-200 dark:border-gray-800">
            <div className="text-xs text-gray-500 mb-3 uppercase tracking-wider">Daily Breakdown</div>
            <div className="flex items-end justify-between gap-2 h-24">
              {tasksByDay.map((day, index) => {
                const maxTasks = Math.max(...tasksByDay.map(d => d.total), 1)
                const height = (day.total / maxTasks) * 100
                const completedHeight = day.total > 0 ? (day.completed / day.total) * height : 0

                return (
                  <div key={index} className="flex-1 flex flex-col items-center gap-1">
                    <div className="w-full relative bg-gray-200 dark:bg-gray-800 rounded" style={{ height: `${height}%` }}>
                      {day.completed > 0 && (
                        <div 
                          className="absolute bottom-0 w-full bg-gray-900 dark:bg-gray-100 rounded"
                          style={{ height: `${completedHeight}%` }}
                        />
                      )}
                    </div>
                    <div className="text-xs text-gray-500">
                      {format(day.date, 'EEE')[0]}
                    </div>
                    <div className="text-xs font-medium">
                      {day.completed}/{day.total}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}
