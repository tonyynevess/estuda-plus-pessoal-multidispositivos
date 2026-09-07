import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Loading } from './UI'

export function ProtectedRoute() {
  const { user, profile, loading } = useAuth(); const location = useLocation()
  if (loading) return <Loading />
  if (!user) return <Navigate to="/login" replace state={{ from: location }} />
  if (profile && !profile.onboarding_completed && location.pathname !== '/onboarding') return <Navigate to="/onboarding" replace />
  return <Outlet />
}
export function SubscriptionRoute() {
  const { subscriptionAllowed, loading } = useAuth()
  if (loading) return <Loading />
  return subscriptionAllowed ? <Outlet /> : <Navigate to="/app/assinatura" replace />
}
export function AdminRoute() {
  const { isAdmin, loading } = useAuth()
  if (loading) return <Loading />
  return isAdmin ? <Outlet /> : <Navigate to="/app" replace />
}
