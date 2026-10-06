# Supabase Setup Instructions

## ⚠️ Project Paused? Resume It First!

If you see a message that your project is paused:

1. Go to [https://app.supabase.com](https://app.supabase.com)
2. Find your "wkly" project in the dashboard
3. Click **"Resume Project"** or **"Restore"** button
4. Wait ~30 seconds for the project to become active
5. Once active, continue to **Step 2** below to get your credentials

---

## Issue: Connection Errors

The Supabase project configured in your `.env` file is not accessible. This causes repeated connection errors:
```
ERR_NAME_NOT_RESOLVED: https://qfntrwggpeptnsxvaoie.supabase.co
```

## Solution: Resume or Create a Supabase Project

### Option A: Resume Existing Project (If You Have One)

1. Go to [https://app.supabase.com](https://app.supabase.com)
2. Log in to your account
3. Find the "wkly" project (or your project name)
4. Click **"Resume Project"** button
5. Wait for the project to become active (~30 seconds)
6. Skip to **Step 2** below to get your credentials

### Option B: Create a New Supabase Project

1. Go to [https://app.supabase.com](https://app.supabase.com)
2. Sign up or log in
3. Click "New Project"
4. Fill in:
   - **Name**: wkly (or any name)
   - **Database Password**: Choose a strong password
   - **Region**: Choose closest to you
5. Wait for project to be created (~2 minutes)

### Step 2: Get Your Credentials

1. Once created, go to **Project Settings** (gear icon) → **API**
2. Copy these two values:
   - **Project URL** (starts with `https://`)
   - **anon public** key (long string starting with `eyJ...`)

### Step 3: Update .env File

1. Open `/Users/anurag/Developer/wkly/.env`
2. Replace the empty values:

```bash
VITE_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Step 4: Set Up Database Schema

Run this SQL in the Supabase SQL Editor:

```sql
-- Enable Row Level Security
create table if not exists public.tasks (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  title text not null,
  description text,
  date date not null,
  completed boolean default false,
  order_index integer not null default 0,
  reminder_time time,
  recurrence text,
  priority text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

create table if not exists public.subtasks (
  id uuid primary key default uuid_generate_v4(),
  task_id uuid references public.tasks(id) on delete cascade not null,
  title text not null,
  completed boolean default false,
  order_index integer not null default 0,
  created_at timestamp with time zone default now()
);

-- Enable RLS
alter table public.tasks enable row level security;
alter table public.subtasks enable row level security;

-- Policies for tasks
create policy "Users can view their own tasks"
  on public.tasks for select
  using (auth.uid() = user_id);

create policy "Users can insert their own tasks"
  on public.tasks for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own tasks"
  on public.tasks for update
  using (auth.uid() = user_id);

create policy "Users can delete their own tasks"
  on public.tasks for delete
  using (auth.uid() = user_id);

-- Policies for subtasks
create policy "Users can view subtasks of their tasks"
  on public.subtasks for select
  using (
    exists (
      select 1 from public.tasks
      where tasks.id = subtasks.task_id
      and tasks.user_id = auth.uid()
    )
  );

create policy "Users can insert subtasks for their tasks"
  on public.subtasks for insert
  with check (
    exists (
      select 1 from public.tasks
      where tasks.id = task_id
      and tasks.user_id = auth.uid()
    )
  );

create policy "Users can update subtasks of their tasks"
  on public.subtasks for update
  using (
    exists (
      select 1 from public.tasks
      where tasks.id = subtasks.task_id
      and tasks.user_id = auth.uid()
    )
  );

create policy "Users can delete subtasks of their tasks"
  on public.subtasks for delete
  using (
    exists (
      select 1 from public.tasks
      where tasks.id = subtasks.task_id
      and tasks.user_id = auth.uid()
    )
  );

-- Indexes for better performance
create index if not exists tasks_user_id_date_idx on public.tasks(user_id, date);
create index if not exists tasks_user_id_completed_idx on public.tasks(user_id, completed);
create index if not exists subtasks_task_id_idx on public.subtasks(task_id);
```

### Step 5: Restart Dev Server

```bash
# Stop the current server (Ctrl+C)
npm run dev
```

## Verification

Your app should now:
- ✅ No more connection errors in console
- ✅ Able to sign up/sign in
- ✅ Create and manage tasks
- ✅ All features working properly

## Troubleshooting

**Still seeing errors?**
1. Double-check the URL and key in `.env` file
2. Make sure there are no extra spaces
3. Restart the dev server
4. Clear browser cache and localStorage

**Database errors?**
1. Run the SQL schema in Supabase SQL Editor
2. Check that RLS policies are created
3. Verify user can authenticate

**Need help?**
- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Discord](https://discord.supabase.com)
