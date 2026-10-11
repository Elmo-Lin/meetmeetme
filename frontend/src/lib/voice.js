import { useCallback, useEffect, useRef, useState } from 'react'

export const MAX_VOICE_SEC = 60

// 優先錄 AAC（各瀏覽器都能播），不支援再退回 WebM / Ogg
const MIME_TYPES = ['audio/mp4;codecs=mp4a.40.2', 'audio/webm;codecs=opus', 'audio/mp4', 'audio/ogg;codecs=opus']

function pickMimeType() {
  if (typeof MediaRecorder === 'undefined') return null
  return MIME_TYPES.find((t) => MediaRecorder.isTypeSupported(t)) ?? ''
}

export function durationLabel(sec) {
  return `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, '0')}`
}

/**
 * 錄音狀態。start() 開始；stop() 回傳 { blob, durationSec }；cancel() 丟掉。
 * 錄滿 MAX_VOICE_SEC 會自動停止並呼叫 onAutoStop。
 */
export function useVoiceRecorder(onAutoStop) {
  const [recording, setRecording] = useState(false)
  const [elapsed, setElapsed] = useState(0)
  const ref = useRef(null)
  const autoStopRef = useRef(onAutoStop)
  useEffect(() => { autoStopRef.current = onAutoStop })

  const cleanup = useCallback(() => {
    const r = ref.current
    if (!r) return
    clearInterval(r.timer)
    r.stream.getTracks().forEach((t) => t.stop())
    ref.current = null
    setRecording(false)
    setElapsed(0)
  }, [])

  const cancel = useCallback(() => {
    const r = ref.current
    if (!r) return
    r.recorder.onstop = null
    if (r.recorder.state !== 'inactive') r.recorder.stop()
    cleanup()
  }, [cleanup])

  // 離開頁面時關掉麥克風
  useEffect(() => cancel, [cancel])

  const start = async () => {
    const mimeType = pickMimeType()
    if (mimeType === null || !navigator.mediaDevices?.getUserMedia) {
      throw new Error('這個瀏覽器不支援錄音')
    }
    let stream
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    } catch {
      throw new Error('無法使用麥克風，請在瀏覽器設定中允許麥克風權限')
    }
    const recorder = new MediaRecorder(stream, mimeType ? { mimeType, audioBitsPerSecond: 48000 } : undefined)
    const chunks = []
    recorder.ondataavailable = (e) => { if (e.data.size) chunks.push(e.data) }
    const startedAt = Date.now()
    const timer = setInterval(() => {
      const sec = Math.floor((Date.now() - startedAt) / 1000)
      setElapsed(sec)
      if (sec >= MAX_VOICE_SEC) autoStopRef.current?.()
    }, 250)
    ref.current = { recorder, stream, chunks, startedAt, timer }
    recorder.start()
    setRecording(true)
  }

  const stop = () => new Promise((resolve) => {
    const r = ref.current
    if (!r) return resolve(null)
    clearInterval(r.timer)
    r.recorder.onstop = () => {
      const durationSec = Math.min(MAX_VOICE_SEC, Math.round((Date.now() - r.startedAt) / 1000))
      const blob = new Blob(r.chunks, { type: r.recorder.mimeType || 'audio/webm' })
      cleanup()
      resolve(durationSec < 1 ? null : { blob, durationSec })
    }
    r.recorder.stop()
  })

  return { recording, elapsed, start, stop, cancel }
}
