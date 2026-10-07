import { useEffect, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { budgetLabel } from '../data/options'
import { Avatar, ShieldIcon } from '../components/ui'
import { api } from '../lib/api'
import { useApi } from '../lib/useApi'
import { lastActiveLabel, timeLabel } from '../lib/format'

// 與 mockServer 的風險字眼一致，打字時先提醒
const RISK_WORDS = ['匯款', '轉帳', '儲值', '點數卡', '投資', '保證金', '車馬費', '誠意金', 'line', 'http']
const POLL_MS = 4000

function mergeById(list, incoming) {
  const seen = new Set(list.map((m) => m.id))
  return [...list, ...incoming.filter((m) => !seen.has(m.id))]
}

export default function Messages() {
  const [params, setParams] = useSearchParams()
  const threadsApi = useApi('/conversations')
  const threads = threadsApi.data ?? []
  const activeId = params.get('c') ?? threads[0]?.id ?? null
  const active = threads.find((t) => t.id === activeId)
  const other = active?.member

  const [mobileOpen, setMobileOpen] = useState(() => params.has('c'))
  const [draft, setDraft] = useState('')
  const [sendError, setSendError] = useState('')
  const [msgs, setMsgs] = useState({ conv: null, list: [] })
  const listRef = useRef(null)
  const reloadThreads = threadsApi.reload

  // 載入目前對話，之後每幾秒只拿新訊息
  useEffect(() => {
    if (!activeId) return
    let cancelled = false
    let lastId = 0
    const load = async (reset) => {
      try {
        const list = await api(`/conversations/${activeId}/messages`, { query: { after: reset ? 0 : lastId } })
        if (cancelled) return
        if (list.length) lastId = list[list.length - 1].id
        setMsgs((prev) => {
          if (reset || prev.conv !== activeId) return { conv: activeId, list }
          return list.length ? { conv: activeId, list: mergeById(prev.list, list) } : prev
        })
        if (reset || list.length) reloadThreads()
      } catch { /* 下一輪再試 */ }
    }
    load(true)
    const timer = setInterval(() => load(false), POLL_MS)
    return () => {
      cancelled = true
      clearInterval(timer)
    }
  }, [activeId, reloadThreads])

  // 別人新開的對話也要出現在列表
  useEffect(() => {
    const timer = setInterval(reloadThreads, 15000)
    return () => clearInterval(timer)
  }, [reloadThreads])

  const messages = msgs.conv === activeId ? msgs.list : []

  useEffect(() => {
    const el = listRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [messages.length, activeId])

  const risky = RISK_WORDS.some((w) => draft.toLowerCase().includes(w))

  const send = async (e) => {
    e.preventDefault()
    const body = draft.trim()
    if (!body || !activeId) return
    setSendError('')
    try {
      const msg = await api(`/conversations/${activeId}/messages`, { method: 'POST', body: { body } })
      setMsgs((prev) => ({ conv: activeId, list: mergeById(prev.conv === activeId ? prev.list : [], [msg]) }))
      setDraft('')
      reloadThreads()
    } catch (err) {
      setSendError(err.message)
    }
  }

  const open = (id) => {
    setParams({ c: id })
    setMobileOpen(true)
    setSendError('')
  }

  if (threadsApi.loading && !threadsApi.data) {
    return <div className="container empty-page muted">載入中…</div>
  }

  return (
    <div className={`chat ${mobileOpen ? 'chat-open' : ''}`}>
      <aside className="chat-list">
        <div className="chat-list-head">
          <h2>訊息</h2>
        </div>
        {threads.length === 0 ? (
          <div className="chat-empty">
            <div>
              <p>還沒有任何對話</p>
              <Link to="/explore" className="btn btn-primary">去探索會員</Link>
            </div>
          </div>
        ) : (
          <ul>
            {threads.map((t) => (
              <li key={t.id}>
                <button className={`thread ${t.id === activeId ? 'active' : ''}`} onClick={() => open(t.id)}>
                  <div className="thread-avatar">
                    <Avatar member={t.member} size={48} />
                    {t.member.online && <span className="online-dot" />}
                  </div>
                  <div className="thread-body">
                    <div className="row-between">
                      <strong>{t.member.nickname}</strong>
                      <span className="small muted">{timeLabel(t.lastMessageAt)}</span>
                    </div>
                    <div className="row-between">
                      <span className="thread-preview">{t.lastMessage ?? '開始聊天吧'}</span>
                      {t.unread > 0 && t.id !== activeId && <span className="unread">{t.unread}</span>}
                    </div>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        )}
      </aside>

      <section className="chat-main">
        {!other ? (
          <div className="chat-empty">選擇一個對話開始聊天</div>
        ) : (
          <>
            <header className="chat-head">
              <button className="chat-back" onClick={() => setMobileOpen(false)} aria-label="返回">←</button>
              <Avatar member={other} size={40} />
              <div className="grow">
                <Link to={`/member/${other.id}`}><strong>{other.nickname}</strong></Link>
                <div className="small muted">{lastActiveLabel(other)} · {budgetLabel(other.budget)} · {other.frequency}</div>
              </div>
              <button className="icon-btn" title="語音通話（即將推出）" aria-label="語音通話" disabled>📞</button>
              <button className="icon-btn" title="視訊通話（即將推出）" aria-label="視訊通話" disabled>🎥</button>
            </header>

            <div className="chat-notice">
              <ShieldIcon size={16} />
              <span>建議先在站內確認身分，再約在公開場所見面。任何要求匯款的訊息請直接檢舉。</span>
            </div>

            <div className="chat-messages" ref={listRef}>
              {messages.map((msg) => (
                <div key={msg.id} className={`bubble-row ${msg.mine ? 'me' : ''}`}>
                  <div className="bubble">
                    {msg.body}
                    {msg.riskFlagged && (
                      <span className="bubble-risk">⚠️ {msg.mine ? '此訊息含有敏感字眼，對方會看到風險提示' : '此訊息含有金錢或外部聯絡字眼，請小心詐騙'}</span>
                    )}
                    <span className="bubble-time">{timeLabel(msg.createdAt)}</span>
                  </div>
                </div>
              ))}
            </div>

            {risky && (
              <div className="risk-banner">
                ⚠️ 偵測到可能的金錢或外部聯絡字眼。MeetMeetMe 不會要求任何人透過平台以外的方式付款，請小心詐騙。
              </div>
            )}
            {sendError && <div className="risk-banner">{sendError}</div>}

            <form className="chat-input" onSubmit={send}>
              <div className="quick-replies">
                {['週末有空嗎？', '想先視訊認識一下', '你平常喜歡做什麼？'].map((q) => (
                  <button type="button" key={q} className="chip" onClick={() => setDraft(q)}>{q}</button>
                ))}
              </div>
              <div className="chat-input-row">
                <input
                  className="input grow"
                  value={draft}
                  maxLength={2000}
                  onChange={(e) => setDraft(e.target.value)}
                  placeholder="輸入訊息…"
                />
                <button className="btn btn-primary" type="submit" disabled={!draft.trim()}>送出</button>
              </div>
            </form>
          </>
        )}
      </section>
    </div>
  )
}
