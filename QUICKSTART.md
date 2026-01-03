# 🚀 Quick Start Guide - Wkly

Get Wkly running in 5 minutes!

## Prerequisites Check

```bash
node --version  # Should be 18.0.0 or higher
npm --version   # Should be 8.0.0 or higher
```

If not installed, get Node.js from [nodejs.org](https://nodejs.org)

## Step 1: Install Dependencies (1 minute)

```bash
cd /Users/anurag/Developer/wkyl
npm install
```

You should see:
```
added 250+ packages in 30s
```

## Step 2: Supabase Setup (2 minutes)

### Create Project
1. Go to [supabase.com](https://supabase.com)
2. Click "New project"
3. Fill in:
   - Name: `wkly`
   - Database Password: (save this!)
   - Region: Choose closest to you
4. Click "Create new project"

Wait ~2 minutes for project to be ready.

### Run Database Schema
1. In Supabase dashboard, click "SQL Editor"
2. Open `supabase-schema.sql` from your project
3. Copy ALL contents
4. Paste into SQL Editor
5. Click "RUN" (or Cmd/Ctrl + Enter)

You should see:
```
Success. No rows returned
```

### Get API Keys
1. Click "Settings" (gear icon)
2. Click "API"
3. Copy these values:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public**: `eyJhbGci...` (long string)

## Step 3: Configure Environment (30 seconds)

```bash
# Copy example file
cp .env.example .env

# Edit .env file
nano .env
# Or use: code .env, vim .env, etc.
```

Paste your values:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGci...your-key-here
```

Save and close (Ctrl+X, Y, Enter for nano).

## Step 4: Start Development Server (30 seconds)

```bash
npm run dev
```

You should see:
```
VITE v5.0.8  ready in 500 ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

## Step 5: Test the App (1 minute)

1. Open [http://localhost:5173](http://localhost:5173)
2. Click "Sign up"
3. Enter email: `test@example.com`
4. Enter password: `password123`
5. Click "Sign Up"

You should see the weekly planner! 🎉

### Quick Test Checklist
- [ ] Sign up works
- [ ] Redirected to planner
- [ ] Current week shown
- [ ] Today is highlighted
- [ ] Click "+ Add task" opens modal
- [ ] Create a task
- [ ] Task appears in the column
- [ ] Click task to edit
- [ ] Drag task to another day
- [ ] Toggle dark mode (☾ icon)
- [ ] Sign out works

## Troubleshooting

### "Missing Supabase environment variables"
```bash
# Check .env file exists
ls -la .env

# Check contents
cat .env

# Restart dev server
# Press Ctrl+C to stop
npm run dev
```

### "Failed to fetch"
- Check Supabase project is not paused
- Verify API keys are correct
- Check internet connection

### Port 5173 already in use
```bash
# Kill process using port
lsof -ti:5173 | xargs kill -9

# Or use different port
npm run dev -- --port 3000
```

### Dark mode not working
- Clear localStorage
- Hard refresh (Cmd/Ctrl + Shift + R)

## Next Steps

### Explore Features
- ✅ Create multiple tasks
- ✅ Drag tasks between days
- ✅ Edit task descriptions
- ✅ Mark tasks complete
- ✅ Navigate to next/previous week
- ✅ Toggle dark mode
- ✅ Test real-time sync (open in 2 browsers)

### Read Documentation
- [README.md](./README.md) - Full documentation
- [SETUP.md](./SETUP.md) - Detailed setup guide
- [DEVELOPMENT.md](./DEVELOPMENT.md) - Developer guide
- [KEYBOARD_SHORTCUTS.md](./KEYBOARD_SHORTCUTS.md) - Shortcuts

### Customize
- Edit colors in `tailwind.config.js`
- Modify components in `src/components/`
- Add features (see CONTRIBUTING.md)

## Deploy to Production

### Vercel (Easiest)
```bash
npm install -g vercel
vercel login
vercel
```

Follow prompts, add environment variables in Vercel dashboard.

### Netlify
```bash
npm install -g netlify-cli
netlify login
netlify deploy --prod
```

Add environment variables in Netlify dashboard.

## Build for Production Locally

```bash
npm run build
npm run preview
```

Output is in `dist/` folder.

## Getting Help

- Read [SETUP.md](./SETUP.md) for detailed instructions
- Check [GitHub Issues](../../issues)
- Review browser console for errors
- Check Supabase dashboard logs

## Success! 🎉

You now have:
- ✅ Working weekly planner
- ✅ Authentication system
- ✅ Real-time sync
- ✅ Dark mode
- ✅ Drag and drop
- ✅ Production-ready app

Start planning your week! 📅

---

**Time to first task**: ~5 minutes
**Time to production**: ~15 minutes

Enjoy Wkly!
