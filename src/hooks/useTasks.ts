import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { Task } from '@/types'
import { startOfWeek, endOfWeek, format } from 'date-fns'

export function useTasks(weekStart: Date, searchQuery?: string, onError?: (message: string) => void) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)

  const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 })
  const startDate = format(startOfWeek(weekStart, { weekStartsOn: 1 }), 'yyyy-MM-dd')
  const endDate = format(weekEnd, 'yyyy-MM-dd')

  const fetchTasks = useCallback(async () => {
    try {
      let query = supabase
        .from('tasks')
        .select(`
          *,
          task_tags(tag_id, tags(*))
        `)
        .order('order_index', { ascending: true })

      // If searching, get all tasks, otherwise filter by week
      if (!searchQuery) {
        query = query.gte('date', startDate).lte('date', endDate)
      }

      const { data, error } = await query

      if (error) {
        console.error('Supabase query error:', error)
        throw error
      }
      
      // Transform the data to include tags directly on the task
      const tasksWithTags = (data || []).map((task: any) => ({
        ...task,
        tags: task.task_tags?.map((tt: any) => tt.tags).filter(Boolean) || []
      }))
      
      setTasks(tasksWithTags || [])
    } catch (error) {
      console.error('Error fetching tasks:', error)
      onError?.('Failed to load tasks. Please refresh the page.')
    } finally {
      setLoading(false)
    }
  }, [startDate, endDate, searchQuery, onError])

  useEffect(() => {
    fetchTasks()

    // Subscribe to realtime changes
    const channel = supabase
      .channel('tasks-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tasks',
        },
        () => {
          fetchTasks()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [fetchTasks])

  const createTask = async (task: Omit<Task, 'id' | 'user_id' | 'created_at'>) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Not authenticated' }

    // Clean task object - remove undefined values
    const cleanTask = Object.fromEntries(
      Object.entries({ ...task, user_id: user.id }).filter(([_, v]) => v !== undefined)
    )

    const { data, error } = await supabase
      .from('tasks')
      .insert(cleanTask)
      .select()
      .single()

    if (error) {
      console.error('Error creating task:', error)
      console.error('Task data attempted:', cleanTask)
    }

    if (!error && data) {
      // Optimistically add to local state
      setTasks(prevTasks => [...prevTasks, data])
    }

    return { data, error }
  }

  const updateTask = async (id: string, updates: Partial<Task>) => {
    // Optimistic update
    setTasks(prevTasks =>
      prevTasks.map(task =>
        task.id === id ? { ...task, ...updates } : task
      )
    )
    
    const { data, error } = await supabase
      .from('tasks')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    // Revert on error
    if (error) {
      fetchTasks()
    }

    return { data, error }
  }

  const deleteTask = async (id: string) => {
    // Optimistically remove from local state
    const previousTasks = tasks
    setTasks(prevTasks => prevTasks.filter(task => task.id !== id))
    
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id)

    // Revert on error
    if (error) {
      setTasks(previousTasks)
    }

    return { error }
  }

  const toggleTaskComplete = async (id: string, completed: boolean) => {
    // Find the task to check if it's recurring
    const task = tasks.find(t => t.id === id)
    
    // Optimistic update
    setTasks(prevTasks =>
      prevTasks.map(task =>
        task.id === id ? { ...task, completed } : task
      )
    )
    
    const result = await updateTask(id, { completed })
    
    // Revert on error
    if (result.error) {
      setTasks(prevTasks =>
        prevTasks.map(task =>
          task.id === id ? { ...task, completed: !completed } : task
        )
      )
      return result
    }
    
    // If task is being completed AND has recurrence, create next instance
    if (completed && task?.recurrence && task.recurrence !== 'none') {
      const nextDate = calculateNextDate(task.date, task.recurrence)
      
      // Create the next recurring task
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        await supabase
          .from('tasks')
          .insert([{
            user_id: user.id,
            title: task.title,
            description: task.description,
            date: nextDate,
            completed: false,
            order_index: task.order_index,
            recurrence: task.recurrence,
            recurrence_parent_id: task.recurrence_parent_id || task.id,
            priority: task.priority,
            reminder_time: task.reminder_time,
          }])
      }
    }
    
    return result
  }

  // Helper function to calculate next occurrence date
  const calculateNextDate = (currentDate: string, recurrence: string): string => {
    const date = new Date(currentDate)
    
    switch (recurrence) {
      case 'daily':
        date.setDate(date.getDate() + 1)
        break
      case 'weekly':
        date.setDate(date.getDate() + 7)
        break
      case 'biweekly':
        date.setDate(date.getDate() + 14)
        break
      case 'monthly':
        date.setMonth(date.getMonth() + 1)
        break
    }
    
    return date.toISOString().split('T')[0]
  }

  const reorderTasks = async (taskId: string, newDate: string, newOrderIndex: number, newTime?: string) => {
    const updates: Partial<Task> = { 
      date: newDate, 
      order_index: newOrderIndex 
    }
    
    // If time is provided, update reminder_time
    if (newTime !== undefined) {
      updates.reminder_time = newTime || null
    }
    
    return updateTask(taskId, updates)
  }

  return {
    tasks,
    loading,
    createTask,
    updateTask,
    deleteTask,
    toggleTaskComplete,
    reorderTasks,
    refetch: fetchTasks,
  }
}
