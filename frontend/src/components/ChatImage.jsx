import { useEffect, useRef, useState } from 'react'
import { useAttachment } from '../lib/useAttachment'

export function ImageIcon({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <circle cx="9" cy="10" r="2" />
      <path d="M21 16l-5-5-9 9" />
    </svg>
  )
}

// 聊天裡的圖片；點一下放大看
export function ImageBubble({ conversationId, message }) {
  const rootRef = useRef(null)
  const { src, failed } = useAttachment(rootRef, conversationId, message.id)
  const [zoomed, setZoomed] = useState(false)

  useEffect(() => {
    if (!zoomed) return
    const onKey = (e) => { if (e.key === 'Escape') setZoomed(false) }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [zoomed])

  return (
    <span className="chat-image" ref={rootRef}>
      {failed ? (
        <span className="chat-image-placeholder">無法載入圖片</span>
      ) : src ? (
        <button type="button" className="chat-image-btn" onClick={() => setZoomed(true)} aria-label="放大圖片">
          <img src={src} alt="" />
        </button>
      ) : (
        <span className="chat-image-placeholder">載入中…</span>
      )}
      {zoomed && (
        <div className="lightbox" role="dialog" aria-modal="true" aria-label="圖片" onClick={() => setZoomed(false)}>
          <img src={src} alt="" />
          <button type="button" className="lightbox-close" aria-label="關閉">✕</button>
        </div>
      )}
    </span>
  )
}
