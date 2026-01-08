import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { ToastProvider } from '@/contexts/ToastContext'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import LoadingSpinner from '@/components/LoadingSpinner'
import Login from '@/pages/Login'
import Register from '@/pages/Register'
import Planner from '@/pages/Planner'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()

  if (loading) {
    return <LoadingSpinner fullScreen />
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}

function App() {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
        <Route
          path="/planner"
          element={
            <ProtectedRoute>
              <Planner />
            </ProtectedRoute>
          }
        />
        <Route path="/" element={<Navigate to="/planner" replace />} />
      </Routes>
        </BrowserRouter>
      </ToastProvider>
    </ErrorBoundary>
  )
}

export default App
