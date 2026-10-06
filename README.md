# Wkly - Minimalist Weekly Planner

A modern, distraction-free weekly planner with a monochrome UI, built with React, TypeScript, and Supabase.

## ✨ Features

### Core Task Management
- **Clean Weekly View**: Monday-to-Sunday layout with today highlighted
- **Drag & Drop**: Seamlessly move tasks between days
- **Real-time Sync**: Instant updates across all devices via Supabase Realtime
- **Search**: Find tasks across all weeks instantly
- **Filters**: Filter by priority, status, or show today's tasks only

### Advanced Task Features
- **Priorities**: Set tasks as low (!), medium (!!), or high (!!!) priority
- **Subtasks/Checklists**: Break down tasks into smaller actionable items with progress tracking
- **Recurring Tasks**: Auto-create tasks daily, weekly, bi-weekly, or monthly
- **Task Templates**: Quick-start with 8 pre-built templates (Meeting, Code Review, Workout, Content Creation, Shopping, Project Setup, Study Session, Blog Post)
- **Task Descriptions**: Add detailed notes to your tasks

### Productivity Tools
- **Focus Mode**: Pomodoro timer with today's tasks for deep work sessions
- **Weekly Stats**: Track completion rates and productivity trends
- **Keyboard Shortcuts**: Navigate and create tasks without touching the mouse (press `?` to see all shortcuts)
- **Dark Mode**: Easy on the eyes, works in any lighting

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+N` | Create new task |
| `Ctrl+K` or `/` | Focus search |
| `Ctrl+F` | Toggle focus mode |
| `Ctrl+S` | Toggle weekly stats |
| `Ctrl+D` | Toggle dark mode |
| `Ctrl+T` | Go to today |
| `Ctrl+←/→` | Navigate weeks |
| `Esc` | Close modal/focus mode |
| `?` | Show keyboard shortcuts help |

## 🛠 Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for blazing-fast development
- **Tailwind CSS** with custom grayscale palette
- **Framer Motion** for smooth animations
- **@dnd-kit** for drag-and-drop functionality
- **date-fns** for date manipulation
- **Google Fonts** (Inter) and **Material Symbols** for typography and icons
- **React Router** for navigation

### Backend
- **Supabase** for:
  - PostgreSQL database
  - Authentication
  - Real-time subscriptions
  - Row Level Security

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn/pnpm
- A Supabase account (free tier works)

### 1. Clone and Install

```bash
cd wkly
npm install
```

### 2. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** and run these migrations in order:
   - `supabase-schema.sql` - Creates main tasks table
   - `supabase-migration-recurrence.sql` - Adds recurring tasks support
   - `supabase-migration-subtasks.sql` - Adds subtasks/checklists support
3. This will create:
   - `tasks` table with priorities and recurrence
   - `subtasks` table for checklists
   - Indexes for performance
   - Row Level Security policies

### 3. Configure Environment Variables

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Edit `.env` and add your Supabase credentials:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

**Where to find these:**
- Go to your Supabase project dashboard
- Click **Settings** > **API**
- Copy the **Project URL** and **anon/public** key

### 4. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### 5. Build for Production

```bash
npm run build
npm run preview
```

## 📁 Project Structure

```
wkly/
├── src/
│   ├── components/
│   │   ├── TaskCard.tsx       # Individual task display
│   │   ├── DayColumn.tsx      # Single day column
│   │   ├── WeekView.tsx       # Full week layout
│   │   └── TaskModal.tsx      # Create/edit modal
│   ├── pages/
│   │   ├── Login.tsx          # Login page
│   │   ├── Register.tsx       # Registration page
│   │   └── Planner.tsx        # Main planner view
│   ├── hooks/
│   │   ├── useAuth.ts         # Authentication hook
│   │   ├── useTasks.ts        # Task CRUD + realtime
│   │   └── useTheme.ts        # Dark mode toggle
│   ├── lib/
│   │   └── supabase.ts        # Supabase client
│   ├── types/
│   │   └── index.ts           # TypeScript types
│   ├── App.tsx                # Main app component
│   ├── main.tsx               # Entry point
│   └── index.css              # Global styles
├── supabase-schema.sql        # Database schema
├── tailwind.config.js         # Tailwind configuration
├── vite.config.ts             # Vite configuration
└── package.json
```

## 🎨 Design Philosophy

### Monochrome Only
- Black (#000000)
- White (#FFFFFF)
- Greys (#111, #222, #333, #666, #999, #DDD)
- **No colors, no gradients, no illustrations**

### Typography First
- Clean, readable fonts
- Generous whitespace
- Clear hierarchy

### Calm & Minimal
- Subtle animations (Framer Motion)
- No unnecessary UI elements
- Focus on content

## 🔐 Security

### Row Level Security (RLS)
All database tables have RLS enabled. Users can only:
- Read their own tasks
- Create tasks for themselves
- Update/delete their own tasks
- Access subtasks through owned tasks

### Authentication
- Email/password authentication via Supabase Auth
- Session persistence
- Automatic redirect for unauthenticated users

## 📱 Usage

### Creating a Task
1. Click **"+ Add task"** under any day
2. Enter title and optional description
3. Select the date
4. Click **"Create"**

### Editing a Task
- Click on any task card to edit

### Completing a Task
- Click the checkbox next to the task

### Moving a Task
- Drag and drop tasks between days or reorder within a day

### Deleting a Task
- Hover over a task and click the **×** button

### Week Navigation
- Use **←** and **→** arrows to navigate weeks
- Click **"Today"** to jump to the current week

### Dark Mode
- Click the theme toggle (☾/☀) in the top-right corner

## 🚧 Future Enhancements

Potential features for future versions:
- Subtasks UI implementation
- Recurring tasks
- Task reminders
- Search and filtering
- Monthly/yearly views
- Export to PDF
- Mobile app (React Native)

## 📝 License

This project is open source and available under the MIT License.

## 🙏 Acknowledgments

Design inspired by minimalist paper planners and modern productivity tools like Notion and Linear.

---

Built with ♥ using React, TypeScript, and Supabase
