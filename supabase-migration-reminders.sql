-- Add reminder_enabled column to tasks table
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS reminder_enabled BOOLEAN DEFAULT true;

-- Add index for better query performance when checking reminders
CREATE INDEX IF NOT EXISTS idx_tasks_reminder ON tasks(reminder_time, reminder_enabled) WHERE reminder_time IS NOT NULL AND completed = false;

-- Update existing tasks with reminders to have reminder_enabled = true
UPDATE tasks SET reminder_enabled = true WHERE reminder_time IS NOT NULL;
