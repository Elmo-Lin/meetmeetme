import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { VERIFICATIONS } from '../data/options'
import { useAuth } from '../auth/context'
import { api } from '../lib/api'
import { useApi } from '../lib/useApi'
import { CheckIcon, ShieldIcon } from '../components/ui'

const MAX_FILE_MB = 5

// 各種認證的上傳說明與檔案數量
const DOCS = {
  photo: {
    hint: '拍一張自拍：比出 YA 手勢，並手持寫有你暱稱的紙張。我們會和你的個人照片比對。',
    maxFiles: 1,
    accept: 'image/jpeg,image/png,image/webp',
  },
  id: {
    hint: '上傳身分證或駕照正面（可再加背面）。可以遮住證號後 6 碼，我們只確認姓名、生日與照片。',
    maxFiles: 2,
    accept: 'image/jpeg,image/png,image/webp',
  },
  income: {
    hint: '上傳近一年的扣繳憑單、薪資單或存款證明，可以遮住帳號等敏感資訊。',
    maxFiles: 3,
    accept: 'image/jpeg,image/png,image/webp,application/pdf',
  },
}

export default function Verify() {
  const { me, refreshMe } = useAuth()
  const { data, error, loading, setData } = useApi('/me/verifications')
  const types = me.role === 'daddy' ? ['photo', 'id', 'income'] : ['photo', 'id']

  const onChanged = (status) => {
    setData(status)
    refreshMe()
  }

  return (
    <div className="container narrow settings">
      <div className="settings-head">
        <span className="eyebrow"><ShieldIcon size={16} /> 認證中心</span>
        <h1>完成認證，讓對方更放心</h1>
        <p className="muted">
          認證資料加密保存、不會公開，只會在你的個人頁顯示徽章。
          {me.role === 'baby' && <> 完成<strong>真人＋身分認證</strong>即可免費使用完整功能。</>}
        </p>
      </div>

      {loading && <p className="muted">載入中…</p>}
      {error && <p className="form-error">{error.message}</p>}
      {data && (
        <>
          <PhoneCard status={data} onVerified={() => refreshMe().then(() => api('/me/verifications')).then(setData)} />
          {types.map((type) => (
            <DocCard
              key={type}
              type={type}
              done={me.verified.includes(type)}
              request={data.requests.find((r) => r.type === type)}
              onChanged={onChanged}
            />
          ))}
        </>
      )}

      <p className="small muted center">
        <Link to="/settings">回到編輯個人資料</Link>
      </p>
    </div>
  )
}

function StatusPill({ done, status }) {
  if (done) return <span className="status-pill ok"><CheckIcon /> 已通過</span>
  if (status === 'PENDING') return <span className="status-pill wait">審核中</span>
  if (status === 'REJECTED') return <span className="status-pill bad">未通過</span>
  return <span className="status-pill">未認證</span>
}

function PhoneCard({ status, onVerified }) {
  const [phone, setPhone] = useState('')
  const [code, setCode] = useState('')
  const [sent, setSent] = useState(null)
  const [cooldown, setCooldown] = useState(0)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (cooldown <= 0) return
    const t = setTimeout(() => setCooldown(cooldown - 1), 1000)
    return () => clearTimeout(t)
  }, [cooldown])

  const run = async (fn) => {
    setBusy(true)
    setError('')
    try {
      await fn()
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  const send = (e) => {
    e.preventDefault()
    run(async () => {
      setSent(await api('/me/phone/send', { method: 'POST', body: { phone } }))
      setCooldown(60)
    })
  }

  const verify = (e) => {
    e.preventDefault()
    run(async () => {
      await api('/me/phone/verify', { method: 'POST', body: { code } })
      setSent(null)
      setCode('')
      await onVerified()
    })
  }

  return (
    <section className="settings-card">
      <div className="row-between">
        <h2>{VERIFICATIONS.phone.label}</h2>
        <StatusPill done={status.phoneVerified} />
      </div>
      <p className="small muted">{VERIFICATIONS.phone.desc}</p>
      {status.phoneVerified ? (
        <p className="small">已認證號碼：{status.phone}</p>
      ) : (
        <>
          <form className="inline-form" onSubmit={send}>
            <input className="input grow" inputMode="tel" placeholder="0912345678" value={phone} onChange={(e) => setPhone(e.target.value)} />
            <button className="btn btn-ghost" disabled={busy || !phone.trim() || cooldown > 0}>
              {cooldown > 0 ? `${cooldown} 秒後可重寄` : sent ? '重新發送' : '發送驗證碼'}
            </button>
          </form>
          {sent && (
            <form className="inline-form" onSubmit={verify}>
              <input className="input grow" inputMode="numeric" maxLength={6} placeholder="6 位數驗證碼" value={code} onChange={(e) => setCode(e.target.value)} />
              <button className="btn btn-primary" disabled={busy || code.trim().length !== 6}>驗證</button>
            </form>
          )}
          {sent?.devCode && <p className="form-ok small">（模擬簡訊，不會真的寄出）驗證碼：{sent.devCode}</p>}
        </>
      )}
      {error && <p className="form-error">{error}</p>}
    </section>
  )
}

function DocCard({ type, done, request, onChanged }) {
  const doc = DOCS[type]
  const [files, setFiles] = useState([])
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const pending = request?.status === 'PENDING'
  const canUpload = !done && !pending

  const pick = (e) => {
    const list = [...e.target.files].slice(0, doc.maxFiles)
    e.target.value = ''
    if (list.some((f) => f.size > MAX_FILE_MB * 1024 * 1024)) {
      setError(`每個檔案不能超過 ${MAX_FILE_MB} MB`)
      return
    }
    setError('')
    setFiles(list)
  }

  const submit = async (e) => {
    e.preventDefault()
    if (!files.length) return
    setBusy(true)
    setError('')
    try {
      const form = new FormData()
      files.forEach((f) => form.append('files', f))
      const status = await api(`/me/verifications/${type}`, { method: 'POST', form })
      setFiles([])
      onChanged(status)
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className="settings-card">
      <div className="row-between">
        <h2>{VERIFICATIONS[type].label}</h2>
        <StatusPill done={done} status={request?.status} />
      </div>
      <p className="small muted">{VERIFICATIONS[type].desc}</p>
      {pending && <p className="small">已收到你的申請，我們會盡快審核。</p>}
      {!done && request?.status === 'REJECTED' && (
        <p className="form-error">未通過原因：{request.rejectReason}。請依說明重新上傳。</p>
      )}
      {canUpload && (
        <form onSubmit={submit}>
          <p className="small">{doc.hint}</p>
          <div className="inline-form">
            <label className="btn btn-ghost file-btn">
              選擇檔案{doc.maxFiles > 1 ? `（最多 ${doc.maxFiles} 個）` : ''}
              <input type="file" accept={doc.accept} multiple={doc.maxFiles > 1} hidden onChange={pick} />
            </label>
            <span className="small muted grow">{files.length ? files.map((f) => f.name).join('、') : '尚未選擇'}</span>
            <button className="btn btn-primary" disabled={busy || !files.length}>{busy ? '上傳中…' : '送出審核'}</button>
          </div>
        </form>
      )}
      {error && <p className="form-error">{error}</p>}
    </section>
  )
}
