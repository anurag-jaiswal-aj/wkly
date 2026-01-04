-- Migration for subtasks table
-- Run this in your Supabase SQL editor

-- Create subtasks table if it doesn't exist
CREATE TABLE IF NOT EXISTS subtasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  completed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Add order_index column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'subtasks' AND column_name = 'order_index'
  ) THEN
    ALTER TABLE subtasks ADD COLUMN order_index INTEGER NOT NULL DEFAULT 0;
  END IF;
END $$;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_subtasks_task_id ON subtasks(task_id);
CREATE INDEX IF NOT EXISTS idx_subtasks_order ON subtasks(task_id, order_index);

-- Enable Row Level Security
ALTER TABLE subtasks ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Users can view subtasks for their tasks" ON subtasks;
DROP POLICY IF EXISTS "Users can insert subtasks for their tasks" ON subtasks;
DROP POLICY IF EXISTS "Users can update subtasks for their tasks" ON subtasks;
DROP POLICY IF EXISTS "Users can delete subtasks for their tasks" ON subtasks;

-- Create RLS policies
-- Users can only see subtasks for their own tasks
CREATE POLICY "Users can view subtasks for their tasks"
  ON subtasks FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM tasks
      WHERE tasks.id = subtasks.task_id
      AND tasks.user_id = auth.uid()
    )
  );

-- Users can insert subtasks for their own tasks
CREATE POLICY "Users can insert subtasks for their tasks"
  ON subtasks FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM tasks
      WHERE tasks.id = subtasks.task_id
      AND tasks.user_id = auth.uid()
    )
  );

-- Users can update subtasks for their own tasks
CREATE POLICY "Users can update subtasks for their tasks"
  ON subtasks FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM tasks
      WHERE tasks.id = subtasks.task_id
      AND tasks.user_id = auth.uid()
    )
  );

-- Users can delete subtasks for their own tasks
CREATE POLICY "Users can delete subtasks for their tasks"
  ON subtasks FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM tasks
      WHERE tasks.id = subtasks.task_id
      AND tasks.user_id = auth.uid()
    )
  );
