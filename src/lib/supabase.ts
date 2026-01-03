import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  public: {
    Tables: {
      tasks: {
        Row: {
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
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          description?: string | null
          date: string
          completed?: boolean
          order_index?: number
          reminder_time?: string | null
          recurrence?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          description?: string | null
          date?: string
          completed?: boolean
          order_index?: number
          reminder_time?: string | null
          recurrence?: string | null
          created_at?: string
        }
      }
      subtasks: {
        Row: {
          id: string
          task_id: string
          title: string
          completed: boolean
        }
        Insert: {
          id?: string
          task_id: string
          title: string
          completed?: boolean
        }
        Update: {
          id?: string
          task_id?: string
          title?: string
          completed?: boolean
        }
      }
    }
  }
}
