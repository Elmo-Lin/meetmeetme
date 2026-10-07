import { handle } from './mockServer'

const TOKEN_KEY = 'meetmeetme.token'

// localStorage 在無痕模式等情況可能丟例外，一律包起來
export const tokenStore = {
  get() {
    try { return localStorage.getItem(TOKEN_KEY) } catch { return null }
  },
  set(token) {
    try { localStorage.setItem(TOKEN_KEY, token) } catch { /* ignore */ }
  },
  clear() {
    try { localStorage.removeItem(TOKEN_KEY) } catch { /* ignore */ }
  },
}

export class ApiError extends Error {
  constructor(status, message) {
    super(message)
    this.status = status
  }
}

let onUnauthorized = () => {}
export function setUnauthorizedHandler(fn) {
  onUnauthorized = fn
}

// 靜態網站沒有後端，請求交給瀏覽器內的 mockServer 處理
export async function api(path, { method = 'GET', body, query } = {}) {
  const token = tokenStore.get()
  const send = (withToken) => handle(method, path, { body, query, token: withToken ? token : null })

  try {
    try {
      return await send(true)
    } catch (err) {
      // 帳號已不存在：清掉並通知登出；公開的 GET 不帶 token 重試一次
      if (err.status !== 401 || !token) throw err
      tokenStore.clear()
      onUnauthorized()
      if (method !== 'GET') throw err
      return await send(false)
    }
  } catch (err) {
    throw new ApiError(err.status ?? 0, err.status ? err.message : '發生錯誤，請稍後再試')
  }
}
