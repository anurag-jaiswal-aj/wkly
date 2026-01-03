import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { Task } from '@/types'
import { startOfWeek, endOfWeek, format } from 'date-fns'

export function useTasks(weekStart: Date) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)

  const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 })
  const startDate = format(startOfWeek(weekStart, { weekStartsOn: 1 }), 'yyyy-MM-dd')
  const endDate = format(weekEnd, 'yyyy-MM-dd')

  const fetchTasks = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .gte('date', startDate)
        .lte('date', endDate)
        .order('order_index', { ascending: true })

      if (error) throw error
      setTasks(data || [])
    } catch (error) {
      console.error('Error fetching tasks:', error)
    } finally {
      setLoading(false)
    }
  }, [startDate, endDate])

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

    const { data, error } = await supabase
      .from('tasks')
      .insert([{ ...task, user_id: user.id }])
      .select()
      .single()

    return { data, error }
  }

  const updateTask = async (id: string, updates: Partial<Task>) => {
    const { data, error } = await supabase
      .from('tasks')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    return { data, error }
  }

  const deleteTask = async (id: string) => {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id)

    return { error }
  }

  const toggleTaskComplete = async (id: string, completed: boolean) => {
    return updateTask(id, { completed })
  }

  const reorderTasks = async (taskId: string, newDate: string, newOrderIndex: number) => {
    return updateTask(taskId, { date: newDate, order_index: newOrderIndex })
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
