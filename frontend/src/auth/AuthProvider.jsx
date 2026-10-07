import { useCallback, useEffect, useMemo, useState } from 'react'
import { api, setUnauthorizedHandler, tokenStore } from '../lib/api'
import { AuthContext } from './context'

export default function AuthProvider({ children }) {
  const [me, setMe] = useState(null)
  // 有 token 時要先問過 /me 才知道是否仍有效
  const [ready, setReady] = useState(() => !tokenStore.get())

  useEffect(() => {
    setUnauthorizedHandler(() => setMe(null))
    if (!tokenStore.get()) return
    api('/me')
      .then(setMe)
      .catch(() => tokenStore.clear())
      .finally(() => setReady(true))
  }, [])

  const accept = useCallback((res) => {
    tokenStore.set(res.token)
    setMe(res.member)
    return res.member
  }, [])

  const value = useMemo(() => ({
    me,
    ready,
    login: (email, password) => api('/auth/login', { method: 'POST', body: { email, password } }).then(accept),
    signup: (body) => api('/auth/signup', { method: 'POST', body }).then(accept),
    logout: () => {
      tokenStore.clear()
      setMe(null)
    },
  }), [me, ready, accept])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
