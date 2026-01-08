import React, { Component, ReactNode } from 'react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50 dark:bg-gray-950">
          <div className="max-w-md w-full bg-white dark:bg-gray-900 rounded-xl shadow-lg p-8 text-center">
            <span className="material-symbols-outlined text-6xl text-red-600 dark:text-red-500 mb-4">
              error
            </span>
            <h1 className="text-2xl font-light mb-2">Something went wrong</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
              {this.state.error?.message || 'An unexpected error occurred'}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2 bg-gray-900 dark:bg-gray-100 text-white dark:text-black 
                       rounded-lg hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors"
            >
              Reload Page
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
