# Database Setup Guide

## Required Migrations

Run these migrations **in order** in your Supabase SQL Editor:

### **Step 1: Add Task Columns (Required First!)**
**File:** `supabase/migrations/002_add_task_columns.sql`

This adds essential columns to your tasks table:
- `reminder_time` - Schedule task reminders
- `reminder_enabled` - Toggle for reminders
- `recurrence` - Repeat pattern (none, daily, weekly, biweekly, monthly)
- `recurrence_parent_id` - Links recurring tasks
- `priority` - Task priority (low, medium, high)

### **Step 2: Tags System**
**File:** `supabase/migrations/003_tags.sql`

This creates the tags feature:
- `tags` table for storing user tags
- `task_tags` junction table for many-to-many relationships
- Proper RLS policies for security

### How to Run Migrations

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Open `supabase/migrations/002_add_task_columns.sql`
4. Copy the SQL and paste it into the SQL Editor
5. Click **Run** to execute
6. Repeat for `003_tags.sql`

## Features

### Creating Tags
- Click "Add tag" in the task modal
- Search existing tags or create new ones
- Choose from 10 preset colors
- Tags are user-specific and reusable

### Using Tags
- Assign multiple tags to any task
- Tags display as colored badges on task cards
- Filter tasks by tag using the dropdown
- Tags persist across all views (Day/Week/Month)

### Color Options
- Blue (#3B82F6)
- Red (#EF4444)
- Green (#10B981)
- Yellow (#F59E0B)
- Purple (#8B5CF6)
- Pink (#EC4899)
- Indigo (#6366F1)
- Teal (#14B8A6)
- Orange (#F97316)
- Gray (#6B7280)

## Usage Examples

**Organization:**
- 🔵 #work - Work-related tasks
- 🟢 #personal - Personal tasks
- 🟣 #health - Health & fitness
- 🟡 #finance - Financial tasks

**Priority/Context:**
- 🔴 #urgent - Time-sensitive
- 🟠 #planning - Future planning
- 🩵 #learning - Educational
- 🩷 #family - Family activities
