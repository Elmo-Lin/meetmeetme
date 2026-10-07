import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from './context'

export default function RequireAuth({ children }) {
  const { me, ready } = useAuth()
  const location = useLocation()
  if (!ready) return <div className="container empty-page muted">載入中…</div>
  if (!me) {
    const next = encodeURIComponent(location.pathname + location.search)
    return <Navigate to={`/login?next=${next}`} replace />
  }
  return children
}
