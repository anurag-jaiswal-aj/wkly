import { useEffect, useState } from 'react'
import { Task } from '@/types'
import { parseISO, isPast, isToday, format } from 'date-fns'

export function useNotifications() {
  const [permission, setPermission] = useState<NotificationPermission>('default')

  useEffect(() => {
    if ('Notification' in window) {
      setPermission(Notification.permission)
    }
  }, [])

  const requestPermission = async () => {
    if (!('Notification' in window)) {
      console.warn('Browser does not support notifications')
      return false
    }

    const result = await Notification.requestPermission()
    setPermission(result)
    return result === 'granted'
  }

  const showNotification = (title: string, options?: NotificationOptions) => {
    console.log('[Notification] Attempting to show:', title, options)
    
    if (!('Notification' in window)) {
      console.warn('[Notification] Browser does not support notifications')
      return
    }

    console.log('[Notification] Permission status:', Notification.permission)

    if (Notification.permission === 'granted') {
      console.log('[Notification] ✅ Showing notification')
      const notification = new Notification(title, {
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        ...options
      })

      // Auto close after 5 seconds
      setTimeout(() => notification.close(), 5000)

      return notification
    } else if (Notification.permission === 'default') {
      console.log('[Notification] ⚠️ Permission not set, requesting...')
      requestPermission().then(granted => {
        if (granted) {
          showNotification(title, options)
        }
      })
    } else {
      console.log('[Notification] ❌ Permission denied')
    }
  }

  const notifyTaskReminder = (task: Task) => {
    const timeStr = task.reminder_time ? format(parseISO(`${task.date}T${task.reminder_time}`), 'h:mm a') : ''
    
    showNotification('⏰ Task Reminder', {
      body: `${task.title}${timeStr ? ` at ${timeStr}` : ''}`,
      tag: `task-${task.id}`,
      requireInteraction: false,
      silent: false
    })
  }

  const notifyTaskDue = (task: Task) => {
    showNotification('📅 Task Due Today', {
      body: task.title,
      tag: `due-${task.id}`,
      requireInteraction: false
    })
  }

  return {
    permission,
    requestPermission,
    showNotification,
    notifyTaskReminder,
    notifyTaskDue,
    isSupported: 'Notification' in window
  }
}

export function useReminderChecker(tasks: Task[], onReminder: (task: Task) => void) {
  useEffect(() => {
    console.log('[Reminder Checker] Initializing with', tasks.length, 'tasks')
    
    const checkReminders = () => {
      const now = new Date()
      console.log('[Reminder Checker] Running at', now.toLocaleTimeString())
      
      tasks.forEach(task => {
        // Skip completed tasks
        if (task.completed) return

        // Check if task has a reminder time set
        if (task.reminder_time) {
          const taskDateTime = parseISO(`${task.date}T${task.reminder_time}`)
          
          console.log(`[Reminder] Task "${task.title}" - Reminder: ${task.reminder_time}, Due: ${taskDateTime.toLocaleString()}`)
          
          // Check if reminder is due (within the last minute)
          const diffMs = now.getTime() - taskDateTime.getTime()
          console.log(`[Reminder] Time difference: ${diffMs}ms (${Math.floor(diffMs / 1000)}s)`)
          
          if (diffMs >= 0 && diffMs < 60000) { // Within last minute
            // Check if we've already notified (using localStorage)
            const notifiedKey = `notified-${task.id}-${task.date}-${task.reminder_time}`
            if (!localStorage.getItem(notifiedKey)) {
              console.log(`[Reminder] 🔔 TRIGGERING notification for "${task.title}"`)
              onReminder(task)
              localStorage.setItem(notifiedKey, 'true')
              
              // Clean up old notification records after 24 hours
              setTimeout(() => {
                localStorage.removeItem(notifiedKey)
              }, 24 * 60 * 60 * 1000)
            } else {
              console.log(`[Reminder] ⏭️ Already notified for "${task.title}"`)
            }
          }
        }

        // Daily reminder for due tasks (at 9 AM)
        if (isToday(parseISO(task.date)) && !task.completed) {
          const hour = now.getHours()
          const minute = now.getMinutes()
          
          if (hour === 9 && minute === 0) {
            const notifiedKey = `daily-${task.id}-${task.date}`
            if (!localStorage.getItem(notifiedKey)) {
              onReminder(task)
              localStorage.setItem(notifiedKey, 'true')
            }
          }
        }
      })
    }

    // Check every minute
    console.log('[Reminder Checker] Setting up interval')
    const interval = setInterval(checkReminders, 60000)
    
    // Check immediately on mount
    checkReminders()

    return () => {
      console.log('[Reminder Checker] Cleanup - removing interval')
      clearInterval(interval)
    }
  }, [tasks, onReminder])
}
