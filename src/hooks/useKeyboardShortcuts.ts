import { useEffect } from 'react'

interface KeyboardShortcut {
  key: string
  ctrl?: boolean
  shift?: boolean
  alt?: boolean
  meta?: boolean
  callback: () => void
  description: string
}

export function useKeyboardShortcuts(shortcuts: KeyboardShortcut[]) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const shortcut = shortcuts.find(s => {
        const keyMatch = e.key.toLowerCase() === s.key.toLowerCase()
        const ctrlMatch = s.ctrl ? e.ctrlKey || e.metaKey : !e.ctrlKey && !e.metaKey
        const shiftMatch = s.shift ? e.shiftKey : !e.shiftKey
        const altMatch = s.alt ? e.altKey : !e.altKey

        return keyMatch && ctrlMatch && shiftMatch && altMatch
      })

      if (shortcut) {
        e.preventDefault()
        shortcut.callback()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [shortcuts])
}

export const KEYBOARD_SHORTCUTS = [
  { key: 'n', ctrl: true, description: 'New task' },
  { key: 'f', ctrl: true, description: 'Toggle focus mode' },
  { key: 's', ctrl: true, description: 'Toggle stats' },
  { key: 'k', ctrl: true, description: 'Search tasks' },
  { key: '/', ctrl: false, description: 'Quick search' },
  { key: 'Escape', ctrl: false, description: 'Close modal/focus mode' },
  { key: 'ArrowLeft', ctrl: true, description: 'Previous week' },
  { key: 'ArrowRight', ctrl: true, description: 'Next week' },
  { key: 't', ctrl: true, description: 'Go to today' },
  { key: 'd', ctrl: true, description: 'Toggle dark mode' },
]
