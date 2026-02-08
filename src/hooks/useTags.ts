import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Tag } from '@/types'

export function useTags() {
  const [tags, setTags] = useState<Tag[]>([])
  const [loading, setLoading] = useState(true)

  const fetchTags = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('tags')
        .select('*')
        .order('name')

      if (error) throw error
      setTags(data || [])
    } catch (error) {
      console.error('Error fetching tags:', error)
      setTags([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTags()
  }, [])

  const createTag = async (name: string, color: string) => {
    try {
      const { data, error } = await supabase
        .from('tags')
        .insert([{ name, color }])
        .select()
        .single()

      if (error) throw error
      
      setTags(prev => [...prev, data].sort((a, b) => a.name.localeCompare(b.name)))
      return { data, error: null }
    } catch (error: any) {
      console.error('Error creating tag:', error)
      return { data: null, error }
    }
  }

  const updateTag = async (id: string, updates: Partial<Tag>) => {
    try {
      const { data, error } = await supabase
        .from('tags')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      
      setTags(prev => prev.map(tag => tag.id === id ? data : tag).sort((a, b) => a.name.localeCompare(b.name)))
      return { data, error: null }
    } catch (error: any) {
      console.error('Error updating tag:', error)
      return { data: null, error }
    }
  }

  const deleteTag = async (id: string) => {
    try {
      const { error } = await supabase
        .from('tags')
        .delete()
        .eq('id', id)

      if (error) throw error
      
      setTags(prev => prev.filter(tag => tag.id !== id))
      return { error: null }
    } catch (error: any) {
      console.error('Error deleting tag:', error)
      return { error }
    }
  }

  const addTagToTask = async (taskId: string, tagId: string) => {
    try {
      const { error } = await supabase
        .from('task_tags')
        .insert([{ task_id: taskId, tag_id: tagId }])

      if (error) throw error
      return { error: null }
    } catch (error: any) {
      console.error('Error adding tag to task:', error)
      return { error }
    }
  }

  const removeTagFromTask = async (taskId: string, tagId: string) => {
    try {
      const { error } = await supabase
        .from('task_tags')
        .delete()
        .eq('task_id', taskId)
        .eq('tag_id', tagId)

      if (error) throw error
      return { error: null }
    } catch (error: any) {
      console.error('Error removing tag from task:', error)
      return { error }
    }
  }

  const getTaskTags = async (taskId: string): Promise<Tag[]> => {
    try {
      const { data, error } = await supabase
        .from('task_tags')
        .select('tag_id, tags(*)')
        .eq('task_id', taskId)

      if (error) throw error
      return data?.map(item => item.tags as any as Tag) || []
    } catch (error) {
      console.error('Error fetching task tags:', error)
      return []
    }
  }

  return {
    tags,
    loading,
    createTag,
    updateTag,
    deleteTag,
    addTagToTask,
    removeTagFromTask,
    getTaskTags,
    refetch: fetchTags
  }
}
