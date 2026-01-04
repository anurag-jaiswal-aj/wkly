-- Add recurrence_parent_id column to tasks table to track recurring task chains
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS recurrence_parent_id UUID REFERENCES tasks(id) ON DELETE SET NULL;

-- Update recurrence column to use enum-like check constraint
ALTER TABLE tasks DROP CONSTRAINT IF EXISTS tasks_recurrence_check;
ALTER TABLE tasks ADD CONSTRAINT tasks_recurrence_check 
  CHECK (recurrence IS NULL OR recurrence IN ('none', 'daily', 'weekly', 'biweekly', 'monthly'));

-- Add index for better performance when querying recurring tasks
CREATE INDEX IF NOT EXISTS idx_tasks_recurrence ON tasks(recurrence) WHERE recurrence IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_tasks_recurrence_parent ON tasks(recurrence_parent_id) WHERE recurrence_parent_id IS NOT NULL;

-- Comment on columns
COMMENT ON COLUMN tasks.recurrence IS 'Recurrence pattern: none, daily, weekly, biweekly, or monthly';
COMMENT ON COLUMN tasks.recurrence_parent_id IS 'Links to the original task in a recurring series';
