import { useEffect, useState } from 'react'
import { api } from './api'

/**
 * 聊天裡的語音和圖片要帶 token 才能讀，所以先 fetch 成 blob 再轉成網址。
 * 元素進入畫面才下載，對話很長時不會一次全部載入。
 */
export function useAttachment(ref, conversationId, messageId) {
  const [src, setSrc] = useState(null)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    let objectUrl
    let cancelled = false
    const load = () => {
      api(`/conversations/${conversationId}/messages/${messageId}/attachment`, { responseType: 'blob' })
        .then((blob) => {
          if (cancelled) return
          objectUrl = URL.createObjectURL(blob)
          setSrc(objectUrl)
        })
        .catch(() => { if (!cancelled) setFailed(true) })
    }
    const observer = new IntersectionObserver((entries) => {
      if (entries.some((e) => e.isIntersecting)) {
        observer.disconnect()
        load()
      }
    })
    observer.observe(el)
    return () => {
      cancelled = true
      observer.disconnect()
      if (objectUrl) URL.revokeObjectURL(objectUrl)
    }
  }, [ref, conversationId, messageId])

  return { src, failed }
}
