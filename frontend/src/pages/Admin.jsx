import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { VERIFICATIONS } from '../data/options'
import { useAuth } from '../auth/context'
import { api } from '../lib/api'
import { useApi } from '../lib/useApi'
import { timeLabel } from '../lib/format'

const REPORT_REASONS = {
  SCAM: '疑似詐騙 / 要求匯款',
  FAKE: '假帳號 / 盜用照片',
  HARASSMENT: '騷擾或不當言論',
  MINOR: '疑似未成年',
  PROSTITUTION: '疑似性交易',
  OTHER: '其他',
}

export default function Admin() {
  const { me } = useAuth()
  const [tab, setTab] = useState('verifications')

  if (!me.membership?.admin) {
    return (
      <div className="container empty-page">
        <h1>需要管理員權限</h1>
        <Link to="/" className="btn btn-primary">回首頁</Link>
      </div>
    )
  }

  return (
    <div className="container settings admin">
      <div className="row-between settings-head">
        <h1>管理後台</h1>
        <div className="segmented">
          <button className={tab === 'verifications' ? 'active' : ''} onClick={() => setTab('verifications')}>認證審核</button>
          <button className={tab === 'reports' ? 'active' : ''} onClick={() => setTab('reports')}>檢舉處理</button>
        </div>
      </div>
      {tab === 'verifications' ? <Verifications /> : <Reports />}
    </div>
  )
}

function Verifications() {
  const { data, error, loading, reload } = useApi('/admin/verifications', { status: 'PENDING' })
  const labels = useApi('/admin/income-labels').data ?? []

  if (loading) return <p className="muted">載入中…</p>
  if (error) return <p className="form-error">{error.message}</p>
  if (!data.length) return <div className="empty"><p>沒有待審核的申請</p></div>

  return data.map((v) => <VerificationCard key={v.id} v={v} labels={labels} onDone={reload} />)
}

function VerificationCard({ v, labels, onDone }) {
  const [incomeLabel, setIncomeLabel] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const m = v.member

  const run = async (fn) => {
    setBusy(true)
    setError('')
    try {
      await fn()
      onDone()
    } catch (err) {
      setError(err.message)
      setBusy(false)
    }
  }

  const approve = () => run(() => api(`/admin/verifications/${v.id}/approve`, { method: 'POST', body: { incomeLabel: incomeLabel || null } }))
  const reject = () => {
    const reason = window.prompt('退件原因（會員會看到）', '照片不清楚，請重新上傳')
    if (reason === null) return
    run(() => api(`/admin/verifications/${v.id}/reject`, { method: 'POST', body: { reason } }))
  }

  return (
    <section className="settings-card">
      <div className="row-between">
        <h2>{VERIFICATIONS[v.type].label}</h2>
        <span className="small muted">{timeLabel(v.createdAt)} 申請</span>
      </div>
      <p className="small">
        <Link to={`/member/${m.id}`} target="_blank">{m.nickname}</Link>
        {' · '}{m.role === 'daddy' ? 'Daddy' : '甜心 Baby'} · {m.age} 歲 · {m.city}
      </p>
      <div className="doc-grid">
        {/* 比對用：會員公開的照片 */}
        {v.type === 'photo' && m.photos.slice(0, 2).map((url) => (
          <figure key={url} className="doc-item">
            <img src={url} alt="" />
            <figcaption>個人照片</figcaption>
          </figure>
        ))}
        {v.files.map((url, i) => <PrivateFile key={url} url={url} label={`上傳檔案 ${i + 1}`} />)}
      </div>
      {v.type === 'income' && (
        <label className="field">
          <span>財力等級（會顯示在個人頁）</span>
          <select value={incomeLabel} onChange={(e) => setIncomeLabel(e.target.value)}>
            <option value="">請選擇</option>
            {labels.map((l) => <option key={l}>{l}</option>)}
          </select>
        </label>
      )}
      {error && <p className="form-error">{error}</p>}
      <div className="row-between">
        <button className="btn btn-ghost" onClick={reject} disabled={busy}>退件</button>
        <button className="btn btn-primary" onClick={approve} disabled={busy || (v.type === 'income' && !incomeLabel)}>核准</button>
      </div>
    </section>
  )
}

// 認證文件不是公開網址，要帶登入憑證取回後再顯示
function PrivateFile({ url, label }) {
  const [file, setFile] = useState(null)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    let objectUrl
    let cancelled = false
    api(url.replace(/^\/api/, ''), { responseType: 'blob' })
      .then((blob) => {
        if (cancelled) return
        objectUrl = URL.createObjectURL(blob)
        setFile({ src: objectUrl, pdf: blob.type === 'application/pdf' })
      })
      .catch(() => !cancelled && setFailed(true))
    return () => {
      cancelled = true
      if (objectUrl) URL.revokeObjectURL(objectUrl)
    }
  }, [url])

  return (
    <figure className="doc-item">
      {failed ? <div className="doc-placeholder">無法載入</div>
        : !file ? <div className="doc-placeholder">載入中…</div>
          : file.pdf ? <a className="doc-placeholder" href={file.src} target="_blank" rel="noreferrer">開啟 PDF</a>
            : <a href={file.src} target="_blank" rel="noreferrer"><img src={file.src} alt={label} /></a>}
      <figcaption>{label}</figcaption>
    </figure>
  )
}

function Reports() {
  const { data, error, loading, reload } = useApi('/admin/reports', { status: 'OPEN' })
  const [busyId, setBusyId] = useState(null)
  const [actionError, setActionError] = useState('')

  const resolve = async (r, action) => {
    if (action === 'BAN' && !window.confirm(`確定要停權「${r.target.nickname}」？對方會立即被登出且無法再登入，其他針對他的檢舉也會一併結案。`)) return
    setBusyId(r.id)
    setActionError('')
    try {
      await api(`/admin/reports/${r.id}/resolve`, { method: 'POST', body: { action } })
      reload()
    } catch (err) {
      setActionError(err.message)
    } finally {
      setBusyId(null)
    }
  }

  if (loading) return <p className="muted">載入中…</p>
  if (error) return <p className="form-error">{error.message}</p>
  if (!data.length) return <div className="empty"><p>沒有待處理的檢舉</p></div>

  return (
    <>
      {actionError && <p className="form-error">{actionError}</p>}
      {data.map((r) => (
        <section key={r.id} className="settings-card">
          <div className="row-between">
            <h2>{REPORT_REASONS[r.reason] ?? r.reason}</h2>
            <span className="small muted">{timeLabel(r.createdAt)}</span>
          </div>
          <p className="small">
            <Link to={`/member/${r.reporter.id}`} target="_blank">{r.reporter.nickname}</Link>
            {' 檢舉 '}
            <Link to={`/member/${r.target.id}`} target="_blank"><strong>{r.target.nickname}</strong></Link>
          </p>
          {r.detail && <p className="expect-note">「{r.detail}」</p>}
          <div className="row-between">
            <button className="btn btn-ghost" onClick={() => resolve(r, 'DISMISS')} disabled={busyId === r.id}>檢舉不成立</button>
            <button className="btn btn-dark" onClick={() => resolve(r, 'BAN')} disabled={busyId === r.id}>停權被檢舉人</button>
          </div>
        </section>
      ))}
    </>
  )
}
