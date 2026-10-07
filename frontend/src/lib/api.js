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

// VITE_USE_MOCK=true 時不需要後端，請求交給瀏覽器內的 mockServer（資料存在 localStorage）
const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true'

const FALLBACK = {
  400: '資料格式有誤，請檢查後再試',
  401: '請先登入',
  403: '沒有權限進行此操作',
  404: '找不到資料',
  409: '資料已存在',
  413: '檔案太大，請選擇 5 MB 以下的照片',
}

function buildUrl(path, query) {
  const url = new URL(`/api${path}`, window.location.origin)
  for (const [k, v] of Object.entries(query ?? {})) {
    if (v === undefined || v === null || v === '' || v === false) continue
    if (Array.isArray(v)) v.forEach((x) => url.searchParams.append(k, x))
    else url.searchParams.set(k, v)
  }
  return url
}

async function sendToServer(method, path, { body, form, query, token, responseType }) {
  const headers = {}
  if (token) headers.Authorization = `Bearer ${token}`
  if (body !== undefined) headers['Content-Type'] = 'application/json'
  let res
  try {
    res = await fetch(buildUrl(path, query), {
      method,
      headers,
      // FormData 讓瀏覽器自己帶 multipart 的 Content-Type
      body: form ?? (body === undefined ? undefined : JSON.stringify(body)),
    })
  } catch {
    throw new ApiError(0, '無法連線到伺服器，請確認網路或稍後再試')
  }

  if (!res.ok) {
    let message = FALLBACK[res.status] ?? '發生錯誤，請稍後再試'
    try {
      const problem = await res.json()
      // 後端自訂的中文訊息才顯示；Spring 預設的英文訊息用上面的通用文字
      if (problem.detail && /[一-鿿]/.test(problem.detail)) message = problem.detail
    } catch { /* 非 JSON */ }
    throw new ApiError(res.status, message)
  }
  if (res.status === 204) return null
  if (responseType === 'blob') return res.blob()
  const text = await res.text()
  return text ? JSON.parse(text) : null
}

async function sendToMock(method, path, options) {
  if (options.form) throw new ApiError(400, '示範模式無法上傳照片，請連接後端後再試')
  const { handle } = await import('./mockServer')
  try {
    return await handle(method, path, options)
  } catch (err) {
    throw new ApiError(err.status ?? 0, err.status ? err.message : '發生錯誤，請稍後再試')
  }
}

export async function api(path, { method = 'GET', body, form, query, responseType } = {}) {
  const token = tokenStore.get()
  const send = (withToken) =>
    (USE_MOCK ? sendToMock : sendToServer)(method, path, { body, form, query, responseType, token: withToken ? token : null })

  try {
    return await send(true)
  } catch (err) {
    // token 失效：清掉並通知登出；公開的 GET 不帶 token 重試一次
    if (err.status !== 401 || !token) throw err
    tokenStore.clear()
    onUnauthorized()
    if (method !== 'GET') throw err
    return await send(false)
  }
}
