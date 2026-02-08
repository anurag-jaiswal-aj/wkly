export interface Task {
  id: string
  user_id: string
  title: string
  description: string | null
  date: string
  completed: boolean
  order_index: number
  reminder_time: string | null
  reminder_enabled?: boolean
  recurrence: 'none' | 'daily' | 'weekly' | 'biweekly' | 'monthly' | null
  recurrence_parent_id?: string | null
  created_at: string
  priority?: 'low' | 'medium' | 'high'
  tags?: Tag[]
}

export interface Tag {
  id: string
  user_id: string
  name: string
  color: string
  created_at: string
}

export interface TaskTag {
  task_id: string
  tag_id: string
}

export interface Subtask {
  id: string
  task_id: string
  title: string
  completed: boolean
  order_index: number
  created_at?: string
}

export interface User {
  id: string
  email: string
}

export interface AuthState {
  user: User | null
  loading: boolean
}
