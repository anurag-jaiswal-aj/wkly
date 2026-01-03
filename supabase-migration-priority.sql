-- Add priority column to tasks table
ALTER TABLE public.tasks 
ADD COLUMN IF NOT EXISTS priority TEXT CHECK (priority IN ('low', 'medium', 'high'));

-- Add tags column for future use
ALTER TABLE public.tasks 
ADD COLUMN IF NOT EXISTS tags TEXT[];

-- Create index for priority filtering
CREATE INDEX IF NOT EXISTS tasks_priority_idx ON public.tasks(priority);
