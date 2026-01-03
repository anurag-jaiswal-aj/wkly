# Wkly - Quick Setup Guide

## Step-by-Step Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Supabase Setup

#### Create a Supabase Project
1. Go to https://supabase.com
2. Click "New Project"
3. Choose an organization (or create one)
4. Set project name: `wkly` (or your choice)
5. Set a strong database password (save it!)
6. Choose a region close to you
7. Click "Create new project"

#### Run the SQL Schema
1. In your Supabase dashboard, go to **SQL Editor**
2. Click **"New query"**
3. Copy the entire contents of `supabase-schema.sql`
4. Paste into the editor
5. Click **"Run"** or press `Cmd/Ctrl + Enter`

You should see:
- ✓ Tables created (tasks, subtasks)
- ✓ Indexes created
- ✓ RLS enabled
- ✓ Policies created

#### Get Your API Keys
1. Go to **Settings** → **API**
2. Find these values:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon/public key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

### 3. Configure Environment Variables

```bash
# Copy the example file
cp .env.example .env

# Edit .env and add your credentials
nano .env  # or use your favorite editor
```

Your `.env` should look like:
```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-very-long-anon-key-here
```

### 4. Start Development Server

```bash
npm run dev
```

The app will open at `http://localhost:5173`

### 5. Create Your First Account

1. Click **"Sign up"**
2. Enter your email and password
3. Click **"Sign Up"**
4. You'll be automatically logged in

**Note**: Email confirmation is disabled by default in Supabase. If you want to enable it:
- Go to **Authentication** → **Settings** → **Email Auth**
- Toggle "Confirm email"

### 6. Start Planning!

- Click **"+ Add task"** to create tasks
- Drag tasks between days
- Click tasks to edit them
- Check the box to mark complete
- Use ← → to navigate weeks
- Click "Today" to jump to current week
- Toggle ☾/☀ for dark/light mode

## Troubleshooting

### Error: "Missing Supabase environment variables"
- Check that `.env` file exists in the root directory
- Verify both `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are set
- Restart the dev server after changing `.env`

### Error: "new row violates row-level security policy"
- Make sure you ran the entire `supabase-schema.sql` script
- Check that RLS policies were created successfully
- Try running the policy creation part of the SQL again

### Tasks not syncing in real-time
- Check that Supabase Realtime is enabled for your project
- Go to **Database** → **Replication** and enable the `tasks` table

### Can't sign in/up
- Verify your Supabase URL and anon key are correct
- Check browser console for errors
- Ensure Supabase project is not paused (free tier auto-pauses after 1 week of inactivity)

## Production Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Go to https://vercel.com
3. Click "New Project"
4. Import your GitHub repository
5. Add environment variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
6. Click "Deploy"

### Netlify

1. Push your code to GitHub
2. Go to https://netlify.com
3. Click "Add new site" → "Import an existing project"
4. Connect to GitHub and select your repo
5. Build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`
6. Add environment variables in Site settings
7. Click "Deploy"

## Database Backup

To backup your Supabase database:
1. Go to **Database** → **Backups**
2. Free tier: Manual backups available
3. Paid tier: Automatic daily backups

You can also export data:
```sql
-- In SQL Editor, run:
COPY (SELECT * FROM tasks) TO STDOUT WITH CSV HEADER;
```

## Support

If you encounter issues:
1. Check the [Supabase Documentation](https://supabase.com/docs)
2. Review browser console for errors
3. Check network tab for failed requests
4. Verify your Supabase project is active

## Next Steps

- Customize the app colors in `tailwind.config.js`
- Add more features (see README.md)
- Deploy to production
- Share with friends!

Happy planning! 📅
