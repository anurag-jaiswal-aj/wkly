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
    if (!('Notification' in window)) {
      console.warn('Browser does not support notifications')
      return
    }

    if (Notification.permission === 'granted') {
      const notification = new Notification(title, {
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        ...options
      })

      // Auto close after 5 seconds
      setTimeout(() => notification.close(), 5000)

      return notification
    } else if (Notification.permission === 'default') {
      requestPermission().then(granted => {
        if (granted) {
          showNotification(title, options)
        }
      })
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
    const checkReminders = () => {
      const now = new Date()
      
      tasks.forEach(task => {
        // Skip completed tasks
        if (task.completed) return

        // Check if task has a reminder time set
        if (task.reminder_time && task.reminder_enabled !== false) {
          const taskDateTime = parseISO(`${task.date}T${task.reminder_time}`)
          
          // Check if reminder is due (within the last minute)
          const diffMs = now.getTime() - taskDateTime.getTime()
          if (diffMs >= 0 && diffMs < 60000) { // Within last minute
            // Check if we've already notified (using localStorage)
            const notifiedKey = `notified-${task.id}-${task.date}-${task.reminder_time}`
            if (!localStorage.getItem(notifiedKey)) {
              onReminder(task)
              localStorage.setItem(notifiedKey, 'true')
              
              // Clean up old notification records after 24 hours
              setTimeout(() => {
                localStorage.removeItem(notifiedKey)
              }, 24 * 60 * 60 * 1000)
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
    const interval = setInterval(checkReminders, 60000)
    
    // Check immediately on mount
    checkReminders()

    return () => clearInterval(interval)
  }, [tasks, onReminder])
}
