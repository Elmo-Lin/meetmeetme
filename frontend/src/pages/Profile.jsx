import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { budgetLabel, VERIFICATIONS, PHOTO_LOCK_TEXT } from '../data/options'
import { Avatar, VerifyBadges, CheckIcon } from '../components/ui'
import { useAuth } from '../auth/context'
import { api } from '../lib/api'
import { useApi } from '../lib/useApi'
import { lastActiveLabel } from '../lib/format'

const REPORT_REASONS = [
  { id: 'SCAM', label: '疑似詐騙 / 要求匯款' },
  { id: 'FAKE', label: '假帳號 / 盜用照片' },
  { id: 'HARASSMENT', label: '騷擾或不當言論' },
  { id: 'MINOR', label: '疑似未成年' },
  { id: 'PROSTITUTION', label: '疑似性交易' },
  { id: 'OTHER', label: '其他' },
]

export default function Profile() {
  const { id } = useParams()
  const { me } = useAuth()
  const navigate = useNavigate()
  const { data: m, error, loading, setData } = useApi(`/members/${id}`, null, me?.id)
  const [busy, setBusy] = useState(false)
  const [notice, setNotice] = useState('')
  const [reporting, setReporting] = useState(false)
  const [photoIdx, setPhotoIdx] = useState(0)

  if (loading) return <div className="container empty-page muted">載入中…</div>
  if (error || !m) {
    return (
      <div className="container empty-page">
        <h1>找不到這位會員</h1>
        <Link to="/explore" className="btn btn-primary">回到探索</Link>
      </div>
    )
  }

  const isMe = me?.id === m.id
  const requireLogin = () => navigate(`/login?next=${encodeURIComponent(`/member/${id}`)}`)

  const run = async (fn) => {
    if (!me) return requireLogin()
    setBusy(true)
    setNotice('')
    try {
      await fn()
    } catch (e) {
      setNotice(e.message)
    } finally {
      setBusy(false)
    }
  }

  const toggleLike = () => run(async () => {
    await api(`/members/${id}/like`, { method: m.liked ? 'DELETE' : 'PUT' })
    setData((d) => ({ ...d, liked: !d.liked }))
  })

  const message = () => run(async () => {
    const { id: conversationId } = await api('/conversations', { method: 'POST', body: { memberId: id } })
    navigate(`/messages?c=${conversationId}`)
  })

  const block = () => {
    if (!me) return requireLogin()
    if (!window.confirm(`確定要封鎖 ${m.nickname}？封鎖後你們將看不到彼此，也無法再傳訊息。`)) return
    run(async () => {
      await api(`/members/${id}/block`, { method: 'PUT' })
      navigate('/explore')
    })
  }

  return (
    <div className="container profile">
      <Link to="/explore" className="back-link">← 返回探索</Link>

      <div className="profile-grid">
        <div className="profile-gallery">
          <div className="gallery-main">
            <Avatar member={m} src={m.photos[photoIdx]} size="100%" rounded={false} blur={!me} />
            {(m.photoLock || !me) && (
              <div className="gallery-lock">
                🔒 {PHOTO_LOCK_TEXT[m.photoLock ?? 'LOGIN']}
                {m.photoCount > 0 && `（共 ${m.photoCount} 張）`}
                {m.photoLock === 'UPGRADE' && <Link to="/pricing" className="btn btn-primary">查看方案</Link>}
              </div>
            )}
          </div>
          {m.photos.length > 1 && (
            <div className="gallery-thumbs">
              {m.photos.map((url, i) => (
                <button key={url} className={photoIdx === i ? 'active' : ''} onClick={() => setPhotoIdx(i)} aria-label={`照片 ${i + 1}`}>
                  <Avatar member={m} src={url} size="100%" rounded={false} blur={!me} />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="profile-info">
          <div className="profile-title">
            <h1>{m.nickname} <span>{m.age}</span></h1>
            {m.demo
              ? <span className="demo-pill inline">示範帳號</span>
              : <span className={`status ${m.online ? 'on' : ''}`}>● {lastActiveLabel(m)}</span>}
          </div>
          {m.demo && (
            <p className="demo-note">這是網站的示範帳號，用來展示個人頁的樣子，照片為 AI 生成、不是真人，也無法收發訊息。</p>
          )}
          <p className="muted">
            {[m.city, m.job, m.heightCm && `${m.heightCm} cm`, m.education].filter(Boolean).join(' · ')}
          </p>
          <VerifyBadges list={m.verified} />

          {m.match != null && (
            <div className="match-box">
              <div className="match-ring" style={{ '--p': m.match }}>
                <span>{m.match}%</span>
              </div>
              <div>
                <strong>與你的契合度</strong>
                <p className="small muted">依預算、見面頻率、關係類型與興趣計算</p>
              </div>
            </div>
          )}

          <div className="expect-card">
            <h3>{isMe ? '我的期待' : '對方的期待'}</h3>
            <dl>
              <div><dt>預算區間</dt><dd>{budgetLabel(m.budget)}</dd></div>
              <div><dt>見面頻率</dt><dd>{m.frequency}</dd></div>
              <div><dt>關係類型</dt><dd>{m.relationshipTypes.join('、')}</dd></div>
              {m.incomeLabel && <div><dt>財力認證</dt><dd>{m.incomeLabel}</dd></div>}
            </dl>
            {m.expectation && <p className="expect-note">「{m.expectation}」</p>}
          </div>

          {notice && <p className="form-error" style={{ marginTop: 16 }}>{notice}</p>}

          {isMe ? (
            <>
              <div className="profile-actions">
                <Link to="/settings" className="btn btn-primary btn-lg grow">編輯個人資料</Link>
              </div>
              <p className="muted small">這是你的個人頁，其他會員看到的就是這樣。</p>
            </>
          ) : (
            <div className="profile-actions">
              <button className={`btn btn-lg ${m.liked ? 'btn-dark' : 'btn-ghost'}`} onClick={toggleLike} disabled={busy}>
                {m.liked ? '♥ 已喜歡' : '♡ 喜歡'}
              </button>
              {m.demo && !me?.demo ? (
                <button className="btn btn-lg grow btn-ghost" disabled>示範帳號無法傳訊</button>
              ) : me && me.role === m.role ? (
                <button className="btn btn-lg grow btn-ghost" disabled title="只能與不同身分的會員聊天">無法傳訊（相同身分）</button>
              ) : (
                <button className="btn btn-primary btn-lg grow" onClick={message} disabled={busy}>傳送訊息</button>
              )}
            </div>
          )}

          {m.intro && (
            <section className="profile-section">
              <h3>關於我</h3>
              <p>{m.intro}</p>
            </section>
          )}

          {m.tags.length > 0 && (
            <section className="profile-section">
              <h3>興趣</h3>
              <div className="chip-group">
                {m.tags.map((t) => <span key={t} className="chip">{t}</span>)}
              </div>
            </section>
          )}

          <section className="profile-section">
            <h3>認證說明</h3>
            <ul className="verify-list">
              {Object.entries(VERIFICATIONS).map(([k, v]) => {
                const ok = m.verified.includes(k)
                return (
                  <li key={k} className={ok ? 'ok' : ''}>
                    <span className="verify-icon">{ok ? <CheckIcon /> : '–'}</span>
                    <div>
                      <strong>{v.label}</strong>
                      <span className="small muted">{ok ? v.desc : '尚未完成'}</span>
                    </div>
                  </li>
                )
              })}
            </ul>
          </section>

          {!isMe && (
            <>
              <div className="profile-footer small muted">
                <button className="link-btn" onClick={block}>封鎖</button>
                <span>·</span>
                <button className="link-btn" onClick={() => (me ? setReporting(!reporting) : requireLogin())}>檢舉此會員</button>
              </div>
              {reporting && (
                <ReportForm
                  memberId={id}
                  onDone={() => { setReporting(false); setNotice('已收到檢舉，我們會在 24 小時內處理。') }}
                  onCancel={() => setReporting(false)}
                />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

function ReportForm({ memberId, onDone, onCancel }) {
  const [reason, setReason] = useState('SCAM')
  const [detail, setDetail] = useState('')
  const [error, setError] = useState('')
  const [sending, setSending] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setSending(true)
    setError('')
    try {
      await api(`/members/${memberId}/report`, { method: 'POST', body: { reason, detail: detail.trim() || null } })
      onDone()
    } catch (err) {
      setError(err.message)
    } finally {
      setSending(false)
    }
  }

  return (
    <form className="report-form" onSubmit={submit}>
      <label className="field">
        <span>檢舉原因</span>
        <select value={reason} onChange={(e) => setReason(e.target.value)}>
          {REPORT_REASONS.map((r) => <option key={r.id} value={r.id}>{r.label}</option>)}
        </select>
      </label>
      <label className="field">
        <span>補充說明（選填）</span>
        <textarea className="input" rows="3" maxLength={1000} value={detail} onChange={(e) => setDetail(e.target.value)} style={{ padding: 12 }} />
      </label>
      {error && <p className="form-error">{error}</p>}
      <div className="row-between">
        <button type="button" className="btn btn-ghost" onClick={onCancel}>取消</button>
        <button type="submit" className="btn btn-primary" disabled={sending}>送出檢舉</button>
      </div>
    </form>
  )
}
