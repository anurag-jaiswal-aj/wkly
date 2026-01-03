# Wkly Development Guide

## Project Overview

Wkly is a minimalist weekly planner built with modern web technologies. This guide covers development workflows, architecture decisions, and contribution guidelines.

## Architecture

### Frontend Architecture
```
├── Pages (routes)
│   ├── Login/Register (public)
│   └── Planner (protected)
├── Components (reusable UI)
│   ├── WeekView (container)
│   ├── DayColumn (sub-container)
│   ├── TaskCard (presentational)
│   └── TaskModal (modal)
├── Hooks (business logic)
│   ├── useAuth (authentication)
│   ├── useTasks (CRUD + realtime)
│   └── useTheme (dark mode)
└── Lib (external services)
    └── supabase (client setup)
```

### Data Flow
1. **Authentication**: `useAuth` → Supabase Auth → Session state
2. **Tasks**: `useTasks` → Supabase DB → Local state → Realtime sync
3. **UI Updates**: User action → Hook → Supabase → Realtime → Re-render

### State Management
- **Local State**: React hooks (useState, useEffect)
- **Server State**: Supabase (source of truth)
- **Real-time**: Supabase Realtime subscriptions
- **No Redux**: Kept simple with hooks

## Development Workflow

### Starting Development
```bash
npm run dev
```

### Code Style
- ESLint configured for TypeScript + React
- Run linting: `npm run lint`
- Auto-fix: `npm run lint -- --fix`

### Type Checking
```bash
npx tsc --noEmit
```

### Building
```bash
npm run build      # Production build
npm run preview    # Preview production build
```

## Design System

### Color Palette (Grayscale Only)
```typescript
colors: {
  black: '#000000',
  white: '#FFFFFF',
  gray: {
    50: '#FAFAFA',   // Lightest background
    100: '#F5F5F5',  // Light background
    200: '#EEEEEE',  // Hover states
    300: '#DDDDDD',  // Borders
    400: '#CCCCCC',  // Disabled text
    500: '#999999',  // Secondary text
    600: '#666666',  // Body text
    700: '#333333',  // Headings
    800: '#222222',  // Dark UI
    900: '#111111',  // Darkest
  }
}
```

### Typography Scale
- Headings: `font-light` (300 weight)
- Body: `font-normal` (400 weight)
- Emphasis: `font-medium` (500 weight)

### Spacing Scale
- Follows Tailwind's default scale (4px base)
- Generous whitespace for calm feel

### Animation Principles
- Subtle and purposeful
- Duration: 150-300ms
- Easing: ease-out for entrances, ease-in for exits
- Framer Motion for complex animations
- CSS transitions for simple hover states

## Component Guidelines

### Component Structure
```typescript
// 1. Imports
import { useState } from 'react'
import { motion } from 'framer-motion'

// 2. Types
interface MyComponentProps {
  title: string
  onAction: () => void
}

// 3. Component
export default function MyComponent({ title, onAction }: MyComponentProps) {
  // Hooks
  const [state, setState] = useState()
  
  // Handlers
  const handleClick = () => {}
  
  // Render
  return <div>...</div>
}
```

### Naming Conventions
- Components: PascalCase (`TaskCard.tsx`)
- Hooks: camelCase with 'use' prefix (`useAuth.ts`)
- Utilities: camelCase (`formatDate.ts`)
- Types: PascalCase (`Task`, `User`)

## Database Schema

### Tasks Table
```sql
id              UUID PRIMARY KEY
user_id         UUID REFERENCES auth.users
title           TEXT NOT NULL
description     TEXT
date            DATE NOT NULL
completed       BOOLEAN DEFAULT false
order_index     INTEGER DEFAULT 0
reminder_time   TIMESTAMP
recurrence      TEXT
created_at      TIMESTAMP
```

### Subtasks Table
```sql
id              UUID PRIMARY KEY
task_id         UUID REFERENCES tasks
title           TEXT NOT NULL
completed       BOOLEAN DEFAULT false
```

## API Patterns

### Creating a Task
```typescript
const { data, error } = await supabase
  .from('tasks')
  .insert([{ 
    title, 
    date, 
    user_id,
    completed: false 
  }])
  .select()
  .single()
```

### Updating a Task
```typescript
const { data, error } = await supabase
  .from('tasks')
  .update({ completed: true })
  .eq('id', taskId)
  .select()
  .single()
```

### Real-time Subscription
```typescript
const channel = supabase
  .channel('tasks-changes')
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'tasks'
  }, () => {
    // Refetch tasks
  })
  .subscribe()
```

## Performance Considerations

### Optimization Strategies
1. **React.memo**: Not needed yet (small component tree)
2. **useCallback**: Used for expensive handlers
3. **Real-time**: Debounce rapid updates if needed
4. **Images**: None (text-only UI)
5. **Code Splitting**: React Router handles route splitting

### Bundle Size
- Target: < 200KB gzipped
- Current: ~150KB with all dependencies
- Monitor with: `npm run build` stats

## Testing Strategy

### Manual Testing Checklist
- [ ] Sign up new user
- [ ] Sign in existing user
- [ ] Create task
- [ ] Edit task
- [ ] Complete task
- [ ] Delete task
- [ ] Drag task between days
- [ ] Reorder tasks within day
- [ ] Navigate weeks
- [ ] Toggle dark mode
- [ ] Sign out
- [ ] Real-time sync (two browsers)

### Future: Automated Tests
- Vitest for unit tests
- Playwright for E2E tests
- React Testing Library for component tests

## Security Best Practices

### Row Level Security
- All queries filtered by `user_id`
- Enforced at database level
- No client-side security

### Environment Variables
- Never commit `.env` file
- Use `.env.example` as template
- Rotate keys if exposed

### Input Validation
- Client-side: Basic validation
- Server-side: Database constraints + RLS

## Deployment

### Environment Requirements
- Node.js 18+
- Supabase project (free tier OK)
- Static hosting (Vercel, Netlify, etc.)

### Build Process
```bash
npm run build
# Output: dist/
```

### Environment Variables (Production)
```
VITE_SUPABASE_URL=your_production_url
VITE_SUPABASE_ANON_KEY=your_production_key
```

## Debugging

### Common Issues

**Tasks not appearing**
- Check RLS policies
- Verify user_id matches auth.uid()
- Check browser console

**Real-time not working**
- Verify Realtime enabled in Supabase
- Check network tab for websocket connection
- Look for subscription errors

**Dark mode not persisting**
- Check localStorage
- Verify theme hook is initialized

### Debug Tools
- React DevTools
- Supabase Dashboard (logs, database browser)
- Browser DevTools (network, console)

## Contributing

### Adding a New Feature
1. Create a new branch
2. Implement feature
3. Test manually
4. Update README if needed
5. Submit PR

### Code Review Checklist
- [ ] Follows design system
- [ ] TypeScript types defined
- [ ] No console.errors
- [ ] Works in light and dark mode
- [ ] Mobile responsive
- [ ] Accessible (keyboard nav)

## Future Roadmap

### Phase 2
- [ ] Subtasks UI
- [ ] Recurring tasks
- [ ] Task reminders

### Phase 3
- [ ] Search and filters
- [ ] Monthly view
- [ ] Export to PDF

### Phase 4
- [ ] Collaborative planning
- [ ] Mobile apps
- [ ] Integrations

## Resources

- [React Docs](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS](https://tailwindcss.com)
- [Supabase Docs](https://supabase.com/docs)
- [Framer Motion](https://www.framer.com/motion/)
- [dnd-kit](https://docs.dndkit.com/)

## License

MIT - Feel free to use for personal or commercial projects.
