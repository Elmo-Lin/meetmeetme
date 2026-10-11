import { useRef, useState } from 'react'
import { useAttachment } from '../lib/useAttachment'
import { durationLabel } from '../lib/voice'

export function MicIcon({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="9" y="3" width="6" height="11" rx="3" />
      <path d="M5 11a7 7 0 0 0 14 0M12 18v3" />
    </svg>
  )
}

/**
 * 語音泡泡。進入畫面就預先下載，點播放時才能在使用者手勢內直接 play()（iOS 的限制）。
 */
export function VoiceBubble({ conversationId, message }) {
  const rootRef = useRef(null)
  const audioRef = useRef(null)
  const { src, failed: loadFailed } = useAttachment(rootRef, conversationId, message.id)
  const [playFailed, setPlayFailed] = useState(false)
  const [playing, setPlaying] = useState(false)
  const [remaining, setRemaining] = useState(message.audioDurationSec)
  const failed = loadFailed || playFailed

  const toggle = () => {
    const audio = audioRef.current
    if (!audio) return
    if (audio.paused) audio.play().catch(() => setPlayFailed(true))
    else audio.pause()
  }

  const total = message.audioDurationSec
  return (
    <span className="voice" ref={rootRef}>
      <button type="button" className="voice-play" onClick={toggle} disabled={!src || failed}
        aria-label={playing ? '暫停' : '播放語音'}>
        {playing ? '❚❚' : '▶'}
      </button>
      <span className="voice-wave" aria-hidden="true">
        <span style={{ width: `${((total - remaining) / total) * 100}%` }} />
      </span>
      <span className="voice-time">{failed ? '無法播放' : durationLabel(remaining)}</span>
      {src && (
        <audio
          ref={audioRef}
          src={src}
          preload="auto"
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          onEnded={() => { setPlaying(false); setRemaining(total) }}
          onTimeUpdate={(e) => setRemaining(Math.max(0, Math.ceil(total - e.currentTarget.currentTime)))}
          onError={() => setPlayFailed(true)}
        />
      )}
    </span>
  )
}
