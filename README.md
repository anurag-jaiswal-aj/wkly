# Wkly - Minimalist Weekly Planner

A distraction-free weekly planner with a monochrome UI, built with React, TypeScript, and Supabase.

## ✨ Features

- **Clean Weekly View**: Monday-to-Sunday layout with today highlighted
- **Drag & Drop**: Seamlessly move tasks between days
- **Real-time Sync**: Instant updates across all devices via Supabase Realtime
- **Task Management**: Create, edit, complete, and delete tasks
- **Authentication**: Secure email/password authentication
- **Dark Mode**: Toggle between light and dark themes
- **Minimalist Design**: Strictly monochrome, text-first UI

## 🛠 Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for blazing-fast development
- **Tailwind CSS** with custom grayscale palette
- **Framer Motion** for subtle animations
- **@dnd-kit** for drag-and-drop functionality
- **date-fns** for date manipulation
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
cd wkyl
npm install
```

### 2. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** and run the contents of `supabase-schema.sql`
3. This will create:
   - `tasks` table
   - `subtasks` table
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
wkyl/
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
