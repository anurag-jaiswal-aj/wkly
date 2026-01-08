import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface OnboardingStep {
  title: string
  description: string
  target?: string
  icon: string
}

const steps: OnboardingStep[] = [
  {
    title: 'Welcome to Wkly',
    description: 'Your minimalist weekly task planner. Let\'s take a comprehensive tour of everything you can do!',
    icon: 'waving_hand',
  },
  {
    title: 'Week Navigation',
    description: 'Navigate between weeks using these arrows. Click "Today" to instantly jump back to the current week.',
    icon: 'calendar_month',
    target: '[data-tour="week-navigation"]',
  },
  {
    title: 'Search Your Tasks',
    description: 'Find any task instantly by typing here. Press Ctrl+K (or /) from anywhere to focus the search.',
    icon: 'search',
    target: '[data-tour="search"]',
  },
  {
    title: 'Filter Options',
    description: 'Use these buttons to filter tasks by priority, status, or view only today\'s tasks.',
    icon: 'filter_alt',
    target: '[data-tour="filters"]',
  },
  {
    title: 'Dark Mode',
    description: 'Toggle between light and dark themes. Your preference is saved automatically.',
    icon: 'dark_mode',
    target: '[data-tour="theme-toggle"]',
  },
  {
    title: 'Weekly Statistics',
    description: 'View your productivity metrics, completion rates, and task distribution for the week.',
    icon: 'bar_chart',
    target: '[data-tour="stats"]',
  },
  {
    title: 'Focus Mode',
    description: 'Enter distraction-free focus mode to concentrate on today\'s most important tasks. Press Ctrl+F to activate.',
    icon: 'center_focus_strong',
    target: '[data-tour="focus-mode"]',
  },
  {
    title: 'Keyboard Shortcuts',
    description: 'Press "?" anytime to see all keyboard shortcuts. Work faster with keyboard navigation!',
    icon: 'keyboard',
    target: '[data-tour="shortcuts"]',
  },
  {
    title: 'Quick Tour Access',
    description: 'Click this help button anytime to replay this tour and refresh your memory.',
    icon: 'help',
    target: '[data-tour="tour-button"]',
  },
  {
    title: 'Create Tasks',
    description: 'Click any "+ Add task" button to create a new task for that day. Or press Ctrl+N for quick creation.',
    icon: 'add_task',
    target: '[data-tour="add-task"]',
  },
  {
    title: 'Task Cards',
    description: 'Each task card shows your task details. Click to edit, hover to see history, or drag to move between days.',
    icon: 'note',
    target: '[data-tour="task-card"]',
  },
  {
    title: 'Drag & Drop',
    description: 'Simply drag any task to a different day to reschedule it. Tasks are automatically saved.',
    icon: 'drag_indicator',
    target: '[data-tour="task-card"]',
  },
  {
    title: 'Task Completion',
    description: 'Check the circle on any task to mark it complete. Completed tasks are tracked in your weekly stats.',
    icon: 'check_circle',
    target: '[data-tour="task-card"]',
  },
  {
    title: 'Edit Task Details',
    description: 'Click any task to edit it. Add descriptions, create subtasks, set priorities, and schedule recurring tasks.',
    icon: 'edit_note',
  },
  {
    title: 'Task History',
    description: 'Hover over any task and click the history icon to see all changes made to that task.',
    icon: 'history',
  },
  {
    title: 'Subtasks & Progress',
    description: 'Break down complex tasks into subtasks. Watch the progress bar fill as you complete them!',
    icon: 'checklist',
  },
  {
    title: 'Priority Levels',
    description: 'Set task priorities (Low, Medium, High) to help you focus on what matters most. High priority tasks show with !!!',
    icon: 'flag',
  },
  {
    title: 'Recurring Tasks',
    description: 'Set tasks to repeat daily, weekly, bi-weekly, or monthly. Perfect for habits and regular activities.',
    icon: 'loop',
  },
  {
    title: 'Task Templates',
    description: 'Save time with pre-built templates for common tasks like meetings, workouts, or daily routines.',
    icon: 'auto_awesome',
  },
  {
    title: 'Offline Mode',
    description: 'Lost internet? No problem! Your changes are saved locally and will sync automatically when you\'re back online.',
    icon: 'cloud_off',
  },
  {
    title: 'Auto-Save',
    description: 'Everything you do is saved automatically. No save buttons, no worries about losing your work.',
    icon: 'cloud_done',
  },
  {
    title: 'You\'re All Set!',
    description: 'Start planning your week and boost your productivity. Remember, you can replay this tour anytime from the help button!',
    icon: 'celebration',
  },
]

interface OnboardingTourProps {
  onComplete: () => void
  isOpen: boolean
}

export default function OnboardingTour({ onComplete, isOpen }: OnboardingTourProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [highlightRect, setHighlightRect] = useState<DOMRect | null>(null)

  // Reset to first step when opened
  useEffect(() => {
    if (isOpen) {
      setCurrentStep(0)
    }
  }, [isOpen])

  // Update highlight position when step changes
  useEffect(() => {
    if (!isOpen) return

    const step = steps[currentStep]
    let targetElement: Element | null = null
    let attempts = 0
    const maxAttempts = 15
    
    const findElement = () => {
      if (!step.target) return
      
      // For elements with multiple matches, find the first visible one
      const elements = document.querySelectorAll(step.target)
      let element: Element | null = null
      
      if (elements.length > 1) {
        // Find first visible element (width and height > 0)
        for (let i = 0; i < elements.length; i++) {
          const rect = elements[i].getBoundingClientRect()
          // Check if element is in viewport and has dimensions
          if (rect.width > 0 && rect.height > 0) {
            element = elements[i]
            break
          }
        }
      } else {
        element = elements[0] || null
      }
      
      if (element) {
        targetElement = element
        
        // Scroll element into view FIRST, then get rect
        element.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' })
        
        // Store reference for timeout
        const el = element;
        
        // Wait for scroll
        setTimeout(function() {
          const domRect = el.getBoundingClientRect();
          setHighlightRect(domRect);
          (el as HTMLElement).style.position = 'relative';
          (el as HTMLElement).style.zIndex = '10000';
        }, 300);
      } else if (attempts < maxAttempts) {
        attempts++
        setTimeout(findElement, 200)
      } else {
        console.warn(`Could not find element with selector: ${step.target}`)
        setHighlightRect(null)
      }
    }
    
    if (step.target) {
      // Initial delay to let DOM settle
      setTimeout(findElement, 100)
    } else {
      setHighlightRect(null)
    }
    
    // Cleanup function
    return () => {
      if (targetElement) {
        (targetElement as HTMLElement).style.zIndex = '';
        (targetElement as HTMLElement).style.position = ''
      }
    }
  }, [currentStep, isOpen])

  // Update highlight on window resize or scroll
  useEffect(() => {
    if (!isOpen || !highlightRect) return

    const updateHighlight = () => {
      const step = steps[currentStep]
      if (step.target) {
        const elements = document.querySelectorAll(step.target)
        let element: Element | null = null
        
        if (elements.length > 1) {
          for (let i = 0; i < elements.length; i++) {
            const rect = elements[i].getBoundingClientRect()
            if (rect.width > 0 && rect.height > 0) {
              element = elements[i]
              break
            }
          }
        } else {
          element = elements[0] || null
        }
        
        if (element) {
          const rect = element.getBoundingClientRect()
          setHighlightRect(rect)
        }
      }
    }

    window.addEventListener('resize', updateHighlight)
    window.addEventListener('scroll', updateHighlight, true) // Use capture phase for all scrolls
    
    return () => {
      window.removeEventListener('resize', updateHighlight)
      window.removeEventListener('scroll', updateHighlight, true)
    }
  }, [currentStep, isOpen, highlightRect])

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      handleComplete()
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSkip = () => {
    handleComplete()
  }

  const handleComplete = () => {
    localStorage.setItem('hasSeenOnboarding', 'true')
    onComplete()
  }

  if (!isOpen) return null

  const step = steps[currentStep]

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[9999]"
      >
        {/* Dark overlay with spotlight cutout */}
        <div className="absolute inset-0 pointer-events-none">
          <svg className="w-full h-full">
            <defs>
              <mask id="spotlight-mask">
                <rect x="0" y="0" width="100%" height="100%" fill="white" />
                {highlightRect && (
                  <rect
                    x={highlightRect.x - 12}
                    y={highlightRect.y - 12}
                    width={highlightRect.width + 24}
                    height={highlightRect.height + 24}
                    rx="12"
                    fill="black"
                  />
                )}
              </mask>
              {/* Glow effect */}
              <filter id="glow">
                <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>
            <rect
              x="0"
              y="0"
              width="100%"
              height="100%"
              fill="rgba(0, 0, 0, 0.85)"
              mask="url(#spotlight-mask)"
            />
          </svg>
        </div>

        {/* Animated highlight border around target */}
        {highlightRect && (
          <>
            {/* Outer glow */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: [0.3, 0.6, 0.3] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="absolute rounded-xl pointer-events-none"
              style={{
                left: highlightRect.x - 20,
                top: highlightRect.y - 20,
                width: highlightRect.width + 40,
                height: highlightRect.height + 40,
                background: 'radial-gradient(circle, rgba(255,255,255,0.3) 0%, transparent 70%)',
                filter: 'blur(8px)',
              }}
            />
            
            {/* Main border with pulse animation */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ 
                opacity: 1, 
                scale: 1,
              }}
              transition={{ duration: 0.3 }}
              className="absolute border-4 border-white rounded-xl pointer-events-none shadow-2xl"
              style={{
                left: highlightRect.x - 12,
                top: highlightRect.y - 12,
                width: highlightRect.width + 24,
                height: highlightRect.height + 24,
                boxShadow: '0 0 0 4px rgba(255, 255, 255, 0.2), 0 0 30px rgba(255, 255, 255, 0.4)',
              }}
            />

            {/* Animated corner accents */}
            {[
              { top: -16, left: -16, rotate: 0 },
              { top: -16, right: -16, rotate: 90 },
              { bottom: -16, right: -16, rotate: 180 },
              { bottom: -16, left: -16, rotate: 270 },
            ].map((pos, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 + i * 0.05, duration: 0.3 }}
                className="absolute w-8 h-8 pointer-events-none"
                style={{
                  ...pos,
                  left: pos.left !== undefined ? highlightRect.x + pos.left : undefined,
                  right: pos.right !== undefined ? window.innerWidth - (highlightRect.x + highlightRect.width) + pos.right : undefined,
                  top: pos.top !== undefined ? highlightRect.y + pos.top : undefined,
                  bottom: pos.bottom !== undefined ? window.innerHeight - (highlightRect.y + highlightRect.height) + pos.bottom : undefined,
                }}
              >
                <svg viewBox="0 0 32 32" fill="none" className="w-full h-full">
                  <path
                    d="M 2 2 L 2 10 M 2 2 L 10 2"
                    stroke="white"
                    strokeWidth="3"
                    strokeLinecap="round"
                    transform={`rotate(${pos.rotate} 16 16)`}
                  />
                </svg>
              </motion.div>
            ))}

            {/* Pulse rings */}
            <motion.div
              animate={{
                scale: [1, 1.05, 1],
                opacity: [0.6, 0.2, 0.6],
              }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="absolute border-2 border-white/40 rounded-xl pointer-events-none"
              style={{
                left: highlightRect.x - 16,
                top: highlightRect.y - 16,
                width: highlightRect.width + 32,
                height: highlightRect.height + 32,
              }}
            />
          </>
        )}

        {/* Tour modal - positioned based on highlight */}
        <div className="absolute inset-0 flex items-center justify-center p-4 pointer-events-none">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white dark:bg-gray-950 rounded-2xl shadow-2xl max-w-md w-full p-8 pointer-events-auto"
            style={{
              marginTop: highlightRect && highlightRect.bottom > window.innerHeight / 2 ? '-300px' : '0'
            }}
          >
            {/* Icon */}
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 rounded-full bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
                <span className="material-symbols-outlined text-5xl" aria-hidden="true">
                  {step.icon}
                </span>
              </div>
            </div>

            {/* Content */}
            <div className="text-center mb-8">
              <h2 className="text-2xl font-light mb-3">{step.title}</h2>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                {step.description}
              </p>
            </div>

            {/* Progress */}
            <div className="flex justify-center gap-2 mb-6">
              {steps.map((_, index) => (
                <div
                  key={index}
                  className={`h-1.5 rounded-full transition-all ${
                    index === currentStep
                      ? 'w-8 bg-black dark:bg-white'
                      : index < currentStep
                      ? 'w-1.5 bg-gray-400 dark:bg-gray-600'
                      : 'w-1.5 bg-gray-200 dark:bg-gray-800'
                  }`}
                />
              ))}
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              {currentStep > 0 && (
                <button
                  onClick={handlePrevious}
                  className="flex-1 btn-secondary"
                >
                  Previous
                </button>
              )}
              {currentStep > 0 && currentStep < steps.length - 1 && (
                <button
                  onClick={handleSkip}
                  className="flex-1 px-4 py-2.5 text-sm text-gray-500 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
                >
                  Skip
                </button>
              )}
              <button
                onClick={handleNext}
                className="flex-1 btn-primary"
              >
                {currentStep === steps.length - 1 ? 'Get Started' : 'Next'}
              </button>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
