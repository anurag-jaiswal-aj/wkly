import { useState, useEffect } from 'react'
import { Task } from '@/types'
import { motion, AnimatePresence } from 'framer-motion'
import { format, isToday, parseISO } from 'date-fns'

interface FocusModeProps {
  tasks: Task[]
  onClose: () => void
  onToggle: (taskId: string) => void
  onEdit: (task: Task) => void
}

type TimerMode = 'work' | 'break'

export default function FocusMode({ tasks, onClose, onToggle, onEdit }: FocusModeProps) {
  // Filter only today's tasks
  const todayTasks = tasks.filter(task => isToday(parseISO(task.date)))
  const pendingTasks = todayTasks.filter(t => !t.completed)
  const completedTasks = todayTasks.filter(t => t.completed)

  // Pomodoro Timer
  const [timerMode, setTimerMode] = useState<TimerMode>('work')
  const [timeLeft, setTimeLeft] = useState(25 * 60) // 25 minutes in seconds
  const [isRunning, setIsRunning] = useState(false)
  const [pomodoroCount, setPomodoroCount] = useState(0)

  const workDuration = 25 * 60
  const breakDuration = 5 * 60

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null

    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => prev - 1)
      }, 1000)
    } else if (timeLeft === 0) {
      // Timer finished
      if (timerMode === 'work') {
        setPomodoroCount(prev => prev + 1)
        setTimerMode('break')
        setTimeLeft(breakDuration)
        playSound()
      } else {
        setTimerMode('work')
        setTimeLeft(workDuration)
        playSound()
      }
      setIsRunning(false)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isRunning, timeLeft, timerMode])

  const playSound = () => {
    // Simple beep using Web Audio API
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(audioContext.destination)

    oscillator.frequency.value = 800
    oscillator.type = 'sine'
    gainNode.gain.value = 0.1

    oscillator.start()
    setTimeout(() => oscillator.stop(), 200)
  }

  const toggleTimer = () => {
    setIsRunning(!isRunning)
  }

  const resetTimer = () => {
    setIsRunning(false)
    setTimeLeft(timerMode === 'work' ? workDuration : breakDuration)
  }

  const skipTimer = () => {
    setIsRunning(false)
    if (timerMode === 'work') {
      setPomodoroCount(prev => prev + 1)
      setTimerMode('break')
      setTimeLeft(breakDuration)
    } else {
      setTimerMode('work')
      setTimeLeft(workDuration)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const progress = timerMode === 'work' 
    ? ((workDuration - timeLeft) / workDuration) * 100
    : ((breakDuration - timeLeft) / breakDuration) * 100

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-white dark:bg-black z-50 overflow-y-auto"
    >
      <div className="min-h-screen p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-12">
          <div>
            <h1 className="text-2xl font-light mb-1">Focus Mode</h1>
            <p className="text-sm text-gray-500">
              {format(new Date(), 'EEEE, MMMM d, yyyy')}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-900 hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors flex items-center justify-center"
            title="Exit Focus Mode"
          >
            ✕
          </button>
        </div>

        <div className="max-w-4xl mx-auto space-y-8">
          {/* Pomodoro Timer */}
          <div className="bg-gray-50 dark:bg-gray-900 rounded-2xl p-8 border border-gray-200 dark:border-gray-800">
            <div className="text-center mb-6">
              <div className="inline-block px-4 py-1 rounded-full bg-gray-200 dark:bg-gray-800 text-sm mb-4">
                {timerMode === 'work' ? '🎯 Work Session' : '☕ Break Time'}
              </div>
              <div className="text-7xl font-light mb-2 tabular-nums">
                {formatTime(timeLeft)}
              </div>
              <div className="text-sm text-gray-500">
                {pomodoroCount} {pomodoroCount === 1 ? 'pomodoro' : 'pomodoros'} completed today
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-2 bg-gray-200 dark:bg-gray-800 rounded-full mb-6 overflow-hidden">
              <motion.div
                className="h-full bg-gray-900 dark:bg-gray-100"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>

            {/* Timer Controls */}
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={toggleTimer}
                className="px-8 py-3 rounded-lg bg-gray-900 dark:bg-gray-100 text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 transition-all text-sm font-medium"
              >
                {isRunning ? '⏸ Pause' : '▶ Start'}
              </button>
              <button
                onClick={resetTimer}
                className="px-6 py-3 rounded-lg bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors text-sm"
              >
                Reset
              </button>
              <button
                onClick={skipTimer}
                className="px-6 py-3 rounded-lg bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors text-sm"
              >
                Skip
              </button>
            </div>
          </div>

          {/* Today's Progress */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 border border-gray-200 dark:border-gray-800 text-center">
              <div className="text-3xl font-light mb-1">{todayTasks.length}</div>
              <div className="text-xs text-gray-500 uppercase tracking-wider">Total Tasks</div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 border border-gray-200 dark:border-gray-800 text-center">
              <div className="text-3xl font-light mb-1">{completedTasks.length}</div>
              <div className="text-xs text-gray-500 uppercase tracking-wider">Completed</div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 border border-gray-200 dark:border-gray-800 text-center">
              <div className="text-3xl font-light mb-1">{pendingTasks.length}</div>
              <div className="text-xs text-gray-500 uppercase tracking-wider">Remaining</div>
            </div>
          </div>

          {/* Pending Tasks */}
          {pendingTasks.length > 0 && (
            <div>
              <h2 className="text-lg font-light mb-4 text-gray-600 dark:text-gray-400">
                To Do ({pendingTasks.length})
              </h2>
              <div className="space-y-2">
                <AnimatePresence>
                  {pendingTasks.map(task => (
                    <motion.div
                      key={task.id}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 border border-gray-200 dark:border-gray-800 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start gap-3">
                        <button
                          onClick={() => onToggle(task.id)}
                          className="mt-1 w-5 h-5 rounded border-2 border-gray-300 dark:border-gray-700 hover:border-gray-900 dark:hover:border-gray-100 transition-colors flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <p className="text-sm leading-relaxed break-words">{task.title}</p>
                            {task.priority && (
                              <span className={`text-xs px-2 py-0.5 rounded flex-shrink-0 ${
                                task.priority === 'high' ? 'bg-gray-900 dark:bg-gray-100 text-white dark:text-black' :
                                task.priority === 'medium' ? 'bg-gray-700 dark:bg-gray-300 text-white dark:text-black' :
                                'bg-gray-300 dark:bg-gray-700'
                              }`}>
                                {task.priority === 'high' ? '!!!' : task.priority === 'medium' ? '!!' : '!'}
                              </span>
                            )}
                          </div>
                          {task.description && (
                            <p className="text-xs text-gray-500 mt-1 break-words">{task.description}</p>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          )}

          {/* Completed Tasks */}
          {completedTasks.length > 0 && (
            <div>
              <h2 className="text-lg font-light mb-4 text-gray-400">
                Completed ({completedTasks.length})
              </h2>
              <div className="space-y-2 opacity-60">
                {completedTasks.map(task => (
                  <motion.div
                    key={task.id}
                    layout
                    className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 border border-gray-200 dark:border-gray-800"
                  >
                    <div className="flex items-start gap-3">
                      <button
                        onClick={() => onToggle(task.id)}
                        className="mt-1 w-5 h-5 rounded bg-gray-900 dark:bg-gray-100 hover:bg-gray-700 dark:hover:bg-gray-300 transition-colors flex-shrink-0 flex items-center justify-center"
                      >
                        <span className="text-white dark:text-black text-xs">✓</span>
                      </button>
                      <p className="text-sm leading-relaxed line-through text-gray-500 break-words flex-1 min-w-0">
                        {task.title}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Empty State */}
          {todayTasks.length === 0 && (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">🎯</div>
              <h3 className="text-xl font-light mb-2">No tasks for today</h3>
              <p className="text-sm text-gray-500">Exit focus mode to add tasks</p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}
