import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/lib/auth-context'

export function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user, loading, isAdmin } = useAuth()
  const location = useLocation()

  if (loading) {
    return <div>Loading...</div>
  }

  if (!user || !isAdmin) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return <>{children}</>
} 