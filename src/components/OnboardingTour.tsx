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
    description: 'Your minimalist weekly task planner. Let\'s get you started!',
    icon: 'waving_hand',
  },
  {
    title: 'Create Tasks',
    description: 'Click the "+ Add task" button in any day column to create a new task. Or use Ctrl+N.',
    icon: 'add_task',
  },
  {
    title: 'Use Templates',
    description: 'Speed up task creation with pre-built templates for common activities.',
    icon: 'auto_awesome',
  },
  {
    title: 'Keyboard Shortcuts',
    description: 'Press "?" to see all keyboard shortcuts. Work faster with Ctrl+K to search, Ctrl+F for focus mode.',
    icon: 'keyboard',
  },
  {
    title: 'You\'re All Set!',
    description: 'Start planning your week. Tasks sync automatically and you can drag to reorder.',
    icon: 'check_circle',
  },
]

interface OnboardingTourProps {
  onComplete: () => void
}

export default function OnboardingTour({ onComplete }: OnboardingTourProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    // Check if user has seen onboarding
    const hasSeenOnboarding = localStorage.getItem('hasSeenOnboarding')
    if (hasSeenOnboarding) {
      setIsVisible(false)
      onComplete()
    }
  }, [onComplete])

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      handleComplete()
    }
  }

  const handleSkip = () => {
    handleComplete()
  }

  const handleComplete = () => {
    localStorage.setItem('hasSeenOnboarding', 'true')
    setIsVisible(false)
    onComplete()
  }

  if (!isVisible) return null

  const step = steps[currentStep]

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white dark:bg-gray-950 rounded-2xl shadow-2xl max-w-md w-full p-8"
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
      </motion.div>
    </AnimatePresence>
  )
}
