import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Check if Supabase is properly configured
export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey)

// Use dummy values if env vars are missing (for development without backend)
const url = supabaseUrl || 'https://placeholder.supabase.co'
const key = supabaseAnonKey || 'placeholder-key'

export const supabase = createClient(url, key, {
  auth: {
    persistSession: true,
    autoRefreshToken: !!supabaseUrl, // Only auto-refresh if we have real credentials
    detectSessionInUrl: true,
  },
})

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
          created_at: string
          reminder_time?: string | null
          reminder_enabled?: boolean
          recurrence?: string | null
          recurrence_parent_id?: string | null
          priority?: string | null
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
          reminder_enabled?: boolean
          recurrence?: string | null
          recurrence_parent_id?: string | null
          priority?: string | null
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
          reminder_enabled?: boolean
          recurrence?: string | null
          recurrence_parent_id?: string | null
          priority?: string | null
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
