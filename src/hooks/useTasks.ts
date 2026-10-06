import { useState, useEffect, useCallback, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { Task, Tag } from '@/types'
import { startOfWeek, endOfWeek, format } from 'date-fns'
import { applyRealtimeEvent } from '@/lib/realtimeTasks'
import { calculateNextDate } from '@/utils/recurrence'

export function useTasks(weekStart: Date, searchQuery?: string, onError?: (message: string) => void) {
  const [tasks, setTasksState] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)

  const tasksRef = useRef<Task[]>([])

  const setTasks = useCallback((action: Task[] | ((prev: Task[]) => Task[])) => {
    setTasksState((prev) => {
      const next = typeof action === 'function' ? action(prev) : action;
      tasksRef.current = next;
      return next;
    });
  }, []);

  const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 })
  const startDate = format(startOfWeek(weekStart, { weekStartsOn: 1 }), 'yyyy-MM-dd')
  const endDate = format(weekEnd, 'yyyy-MM-dd')

  const fetchTasks = useCallback(async (options?: { abortSignal?: AbortSignal; background?: boolean }) => {
    try {
      if (!options?.background) setLoading(true)
      let query = supabase
        .from('tasks')
        .select(`
          *,
          task_tags(tag_id, tags(*))
        `)
        .order('order_index', { ascending: true })

      // If searching, filter by search term, otherwise filter by week
      if (searchQuery) {
        // Safely escape quotes for the Supabase .or() syntax
        const safeQuery = searchQuery.replace(/"/g, '""')
        query = query.or(`title.ilike."%${safeQuery}%",description.ilike."%${safeQuery}%"`)
      } else {
        query = query.gte('date', startDate).lte('date', endDate)
      }

      const { data, error } = await query

      if (options?.abortSignal?.aborted) return

      if (error) {
        console.error('Supabase query error:', error)
        throw error
      }
      
      // Transform the data to include tags directly on the task
      const rows = (data as unknown as Array<Task & { task_tags?: Array<{ tags?: Tag }>}>) || []
      const tasksWithTags = rows.map((task) => ({
        ...task,
        tags: (task.task_tags || []).map(tt => tt.tags as Tag).filter(Boolean)
      }))

      setTasks(tasksWithTags || [])
    } catch (error) {
      if (options?.abortSignal?.aborted) return
      console.error('Error fetching tasks:', error)
      onError?.('Failed to load tasks. Please refresh the page.')
    } finally {
      if (!options?.abortSignal?.aborted && !options?.background) {
        setLoading(false)
      }
    }
  }, [startDate, endDate, searchQuery, onError, setTasks])

  const inFlightTags = useRef<Set<string>>(new Set())

  const fetchTaskTags = useCallback(async (taskId: string) => {
    if (inFlightTags.current.has(taskId)) return;
    inFlightTags.current.add(taskId);

    try {
      const { data, error } = await supabase
        .from('task_tags')
        .select('tag_id, tags(*)')
        .eq('task_id', taskId)

      if (!error && data) {
        const tags = data.map(tt => tt.tags as unknown as Tag).filter(Boolean)
        setTasks(prev => prev.map(t => t.id === taskId ? { ...t, tags } : t))
      }
    } catch (e) {
      console.error('Failed to fetch tags for task', taskId, e)
    } finally {
      inFlightTags.current.delete(taskId);
    }
  }, [setTasks]);

  useEffect(() => {
    const abortController = new AbortController()
    fetchTasks({ abortSignal: abortController.signal })

    let channel: ReturnType<typeof supabase.channel> | undefined;
    let isMounted = true;

    const setupSubscription = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || !isMounted) return;

      channel = supabase
        .channel(`tasks-changes-${user.id}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'tasks',
            filter: `user_id=eq.${user.id}`
          },
          (payload) => {
            const result = applyRealtimeEvent(
              tasksRef.current,
              payload as import('@/lib/realtimeTasks').RealtimePayload,
              searchQuery,
              startDate,
              endDate
            );

            setTasks(result.tasks);

            for (const taskId of result.requireTagsForIds) {
              fetchTaskTags(taskId);
            }
          }
        )
        .subscribe()
    };

    setupSubscription();

    return () => {
      isMounted = false;
      abortController.abort();
      if (channel) supabase.removeChannel(channel)
    }
  }, [fetchTasks, startDate, endDate, searchQuery, setTasks, fetchTaskTags])

  const createTask = async (task: Omit<Task, 'id' | 'user_id' | 'created_at'>) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Not authenticated' }

    // Clean task object - remove undefined values
    const cleanTask = Object.fromEntries(
      Object.entries({ ...task, user_id: user.id }).filter(([, v]) => v !== undefined)
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
    // Capture state for potential rollback
    const previousTasks = tasksRef.current;

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
      setTasks(previousTasks)
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
    const task = tasksRef.current.find(t => t.id === id)
    
    // Call updateTask which handles the optimistic update and rollback securely
    const result = await updateTask(id, { completed })
    
    if (result.error) return result
    
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
