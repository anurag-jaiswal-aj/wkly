-- Create tasks table
CREATE TABLE IF NOT EXISTS public.tasks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    date DATE NOT NULL,
    completed BOOLEAN DEFAULT false NOT NULL,
    order_index INTEGER DEFAULT 0 NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create subtasks table
CREATE TABLE IF NOT EXISTS public.subtasks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    task_id UUID REFERENCES public.tasks(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    completed BOOLEAN DEFAULT false NOT NULL
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS tasks_user_id_idx ON public.tasks(user_id);
CREATE INDEX IF NOT EXISTS tasks_date_idx ON public.tasks(date);
CREATE INDEX IF NOT EXISTS subtasks_task_id_idx ON public.subtasks(task_id);

-- Enable Row Level Security
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subtasks ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own tasks" ON public.tasks;
DROP POLICY IF EXISTS "Users can create their own tasks" ON public.tasks;
DROP POLICY IF EXISTS "Users can update their own tasks" ON public.tasks;
DROP POLICY IF EXISTS "Users can delete their own tasks" ON public.tasks;
DROP POLICY IF EXISTS "Users can view subtasks of their tasks" ON public.subtasks;
DROP POLICY IF EXISTS "Users can create subtasks for their tasks" ON public.subtasks;
DROP POLICY IF EXISTS "Users can update subtasks of their tasks" ON public.subtasks;
DROP POLICY IF EXISTS "Users can delete subtasks of their tasks" ON public.subtasks;

-- Tasks policies
CREATE POLICY "Users can view their own tasks"
    ON public.tasks FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own tasks"
    ON public.tasks FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tasks"
    ON public.tasks FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own tasks"
    ON public.tasks FOR DELETE
    USING (auth.uid() = user_id);

-- Subtasks policies
CREATE POLICY "Users can view subtasks of their tasks"
    ON public.subtasks FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.tasks
            WHERE tasks.id = subtasks.task_id
            AND tasks.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can create subtasks for their tasks"
    ON public.subtasks FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.tasks
            WHERE tasks.id = subtasks.task_id
            AND tasks.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update subtasks of their tasks"
    ON public.subtasks FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.tasks
            WHERE tasks.id = subtasks.task_id
            AND tasks.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete subtasks of their tasks"
    ON public.subtasks FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.tasks
            WHERE tasks.id = subtasks.task_id
            AND tasks.user_id = auth.uid()
        )
    );
