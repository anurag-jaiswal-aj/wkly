import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { parseNaturalLanguage, getParseExamples, ParsedTask } from '@/utils/naturalLanguageParser'
import { format, parseISO } from 'date-fns'

interface QuickAddTaskProps {
  onCreateTask: (task: ParsedTask) => void
  defaultDate?: string
}

export default function QuickAddTask({ onCreateTask, defaultDate }: QuickAddTaskProps) {
  const [input, setInput] = useState('')
  const [preview, setPreview] = useState<ParsedTask | null>(null)
  const [showExamples, setShowExamples] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (input.trim()) {
      const parsed = parseNaturalLanguage(input)
      if (defaultDate) {
        parsed.date = defaultDate
      }
      setPreview(parsed)
    } else {
      setPreview(null)
    }
  }, [input, defaultDate])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return

    const parsed = parseNaturalLanguage(input)
    if (defaultDate) {
      parsed.date = defaultDate
    }
    
    onCreateTask(parsed)
    setInput('')
    setPreview(null)
  }

  const handleExampleClick = (example: string) => {
    setInput(example)
    inputRef.current?.focus()
    setShowExamples(false)
  }

  return (
    <div className="relative">
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onFocus={() => !input && setShowExamples(true)}
            onBlur={() => setTimeout(() => setShowExamples(false), 200)}
            placeholder="Type naturally: 'Buy milk tomorrow at 3pm high priority'"
            className="w-full px-4 py-3 pr-12 text-sm border-2 border-gray-300 dark:border-gray-700 rounded-lg
                     focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                     bg-white dark:bg-gray-900
                     transition-all"
            autoComplete="off"
            aria-label="Quick add task"
          />
          <button
            type="submit"
            disabled={!input.trim()}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 
                     text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300
                     disabled:text-gray-300 dark:disabled:text-gray-600
                     disabled:cursor-not-allowed transition-colors"
            aria-label="Create task"
          >
            <span className="material-symbols-outlined">add_circle</span>
          </button>
        </div>

        {/* Preview of parsed task */}
        <AnimatePresence>
          {preview && input.trim() && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute z-10 mt-2 w-full p-3 bg-white dark:bg-gray-800 
                       border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg"
            >
              <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">Preview:</div>
              <div className="space-y-1">
                <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {preview.title}
                </div>
                <div className="flex flex-wrap gap-2 text-xs">
                  <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded">
                    📅 {format(parseISO(preview.date), 'MMM d, yyyy')}
                  </span>
                  {preview.time && (
                    <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 rounded">
                      🕐 {preview.time}
                    </span>
                  )}
                  {preview.priority && (
                    <span className={`px-2 py-1 rounded ${
                      preview.priority === 'high' 
                        ? 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300' 
                        : preview.priority === 'medium'
                        ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300'
                        : 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300'
                    }`}>
                      {preview.priority === 'high' ? '🔴' : preview.priority === 'medium' ? '🟡' : '🟢'} {preview.priority}
                    </span>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Examples dropdown */}
        <AnimatePresence>
          {showExamples && !input && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute z-10 mt-2 w-full p-3 bg-white dark:bg-gray-800 
                       border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg"
            >
              <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                Try examples:
              </div>
              <div className="space-y-1">
                {getParseExamples().map((example, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => handleExampleClick(example)}
                    className="w-full text-left px-2 py-1.5 text-sm text-gray-700 dark:text-gray-300
                             hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                  >
                    {example}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </form>
    </div>
  )
}
