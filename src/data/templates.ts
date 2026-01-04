export interface TaskTemplate {
  id: string
  name: string
  title: string
  description?: string
  priority?: 'low' | 'medium' | 'high'
  subtasks?: string[]
}

export const DEFAULT_TEMPLATES: TaskTemplate[] = [
  {
    id: 'meeting',
    name: 'Meeting',
    title: 'Team Meeting',
    priority: 'medium',
    subtasks: [
      'Review agenda',
      'Prepare notes',
      'Share meeting link',
      'Send follow-up summary'
    ]
  },
  {
    id: 'review',
    name: 'Code Review',
    title: 'Code Review',
    priority: 'high',
    subtasks: [
      'Review code changes',
      'Test functionality',
      'Check for best practices',
      'Leave feedback'
    ]
  },
  {
    id: 'workout',
    name: 'Workout',
    title: 'Daily Workout',
    priority: 'medium',
    subtasks: [
      'Warm up (10 min)',
      'Main exercise (30 min)',
      'Cool down (10 min)',
      'Stretch'
    ]
  },
  {
    id: 'content',
    name: 'Content Creation',
    title: 'Create Content',
    priority: 'medium',
    subtasks: [
      'Research topic',
      'Create outline',
      'Write draft',
      'Edit and polish',
      'Add visuals',
      'Publish'
    ]
  },
  {
    id: 'shopping',
    name: 'Shopping',
    title: 'Grocery Shopping',
    priority: 'low',
    subtasks: [
      'Make shopping list',
      'Check pantry',
      'Go to store',
      'Put away groceries'
    ]
  },
  {
    id: 'project',
    name: 'Project Setup',
    title: 'New Project Setup',
    priority: 'high',
    subtasks: [
      'Define requirements',
      'Create timeline',
      'Set up repository',
      'Configure tools',
      'Create initial docs'
    ]
  },
  {
    id: 'study',
    name: 'Study Session',
    title: 'Study Session',
    priority: 'medium',
    subtasks: [
      'Review previous notes',
      'Read new material',
      'Take notes',
      'Practice problems',
      'Review and summarize'
    ]
  },
  {
    id: 'blog',
    name: 'Blog Post',
    title: 'Write Blog Post',
    priority: 'medium',
    subtasks: [
      'Choose topic',
      'Research',
      'Create outline',
      'Write first draft',
      'Add images',
      'Edit and proofread',
      'Publish and share'
    ]
  }
]
