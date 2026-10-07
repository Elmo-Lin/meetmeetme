import { useCallback, useEffect, useState } from 'react'
import { api } from './api'

/**
 * GET 資料。path 為 null 時不發請求。
 * extraKey 變動時也會重抓（例如登入狀態改變，契合度要重算）。
 */
export function useApi(path, query, extraKey) {
  const key = path ? JSON.stringify([path, query ?? null, extraKey ?? null]) : null
  const [state, setState] = useState({ key: null, data: null, error: null })
  const [version, setVersion] = useState(0)

  useEffect(() => {
    if (!key) return
    const [p, q] = JSON.parse(key)
    let cancelled = false
    api(p, { query: q ?? undefined })
      .then((data) => !cancelled && setState({ key, data, error: null }))
      .catch((error) => !cancelled && setState({ key, data: null, error }))
    return () => { cancelled = true }
  }, [key, version])

  const fresh = state.key === key
  const reload = useCallback(() => setVersion((v) => v + 1), [])
  const setData = useCallback(
    (updater) => setState((s) => ({ ...s, data: typeof updater === 'function' ? updater(s.data) : updater })),
    [],
  )

  return {
    data: fresh ? state.data : null,
    error: fresh ? state.error : null,
    loading: !!key && !fresh,
    reload,
    setData,
  }
}

export function useDebounced(value, ms = 300) {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), ms)
    return () => clearTimeout(t)
  }, [value, ms])
  return debounced
}
