/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useState, useEffect } from 'react'
import { User } from '@supabase/supabase-js'

import { supabase, isSupabaseConfigured } from '@/lib/supabase'

interface AuthContextType {
  user: User | null
  loading: boolean
  error: string | null
  isPasswordRecovery: boolean
  signUp: (email: string, password: string) => Promise<{ data: unknown; error: { message: string } | null }>
  signIn: (email: string, password: string) => Promise<{ data: unknown; error: { message: string } | null }>
  signOut: () => Promise<{ error: { message: string } | null }>
  resetPasswordForEmail: (email: string) => Promise<{ error: { message: string } | null }>
  updatePassword: (password: string) => Promise<{ error: { message: string } | null }>
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isPasswordRecovery, setIsPasswordRecovery] = useState(false)

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setLoading(false)
      return
    }

    supabase.auth.getSession()
      .then(({ data: { session }, error }) => {
        setUser(session?.user ?? null)
        if (error) {
          setError(error.message)
        }
        setLoading(false)
      })
      .catch((err) => {
        setError(err?.message || 'Unable to connect to authentication service')
        setLoading(false)
      })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null)
      if (event === 'PASSWORD_RECOVERY') {
        setIsPasswordRecovery(true)
      } else if (event === 'SIGNED_OUT') {
        setIsPasswordRecovery(false)
      }
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const signUp = async (email: string, password: string) => {
    if (!isSupabaseConfigured) {
      return { 
        data: null, 
        error: { message: 'Supabase is not configured. Please see SUPABASE_SETUP.md for setup instructions.' } 
      }
    }
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      })
      return { data, error }
    } catch (err) {
      console.error('signUp failed:', err)
      return { data: null, error: { message: 'Unable to connect to authentication service' } }
    }
  }

  const signIn = async (email: string, password: string) => {
    if (!isSupabaseConfigured) {
      return { 
        data: null, 
        error: { message: 'Supabase is not configured. Please see SUPABASE_SETUP.md for setup instructions.' } 
      }
    }
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      return { data, error }
    } catch (err) {
      console.error('signIn failed:', err)
      return { data: null, error: { message: 'Unable to connect to authentication service' } }
    }
  }

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      return { error }
    } catch (err) {
      console.error('signOut failed:', err)
      return { error: { message: 'Unable to sign out' } }
    }
  }

  const resetPasswordForEmail = async (email: string) => {
    if (!isSupabaseConfigured) {
      return { error: { message: 'Supabase is not configured.' } }
    }
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/update-password`,
      })
      return { error }
    } catch (err) {
      console.error('resetPasswordForEmail failed:', err)
      return { error: { message: 'Unable to connect to authentication service' } }
    }
  }

  const updatePassword = async (password: string) => {
    if (!isSupabaseConfigured) {
      return { error: { message: 'Supabase is not configured.' } }
    }
    try {
      const { error } = await supabase.auth.updateUser({ password })
      return { error }
    } catch (err) {
      console.error('updatePassword failed:', err)
      return { error: { message: 'Unable to connect to authentication service' } }
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, error, isPasswordRecovery, signUp, signIn, signOut, resetPasswordForEmail, updatePassword }}>
      {children}
    </AuthContext.Provider>
  )
}

