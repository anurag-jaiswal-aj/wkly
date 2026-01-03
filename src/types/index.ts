export interface Task {
  id: string
  user_id: string
  title: string
  description: string | null
  date: string
  completed: boolean
  order_index: number
  reminder_time: string | null
  recurrence: string | null
  created_at: string
  priority?: 'low' | 'medium' | 'high'
  tags?: string[]
}

export interface Subtask {
  id: string
  task_id: string
  title: string
  completed: boolean
}

export interface User {
  id: string
  email: string
}

export interface AuthState {
  user: User | null
  loading: boolean
}
