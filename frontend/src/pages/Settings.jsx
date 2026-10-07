import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { CITIES, BUDGETS, FREQUENCIES, RELATIONSHIP_TYPES, EDUCATIONS } from '../data/options'
import { useAuth } from '../auth/context'
import { api } from '../lib/api'

const MAX_PHOTOS = 6
const MAX_PHOTO_MB = 5

// 把會員資料轉成表單欄位；空值一律用空字串，input 才不會變成 uncontrolled
function toForm(me) {
  return {
    nickname: me.nickname ?? '',
    city: me.city ?? '',
    job: me.job ?? '',
    heightCm: me.heightCm ?? '',
    education: me.education ?? '',
    budget: me.budget ?? '',
    frequency: me.frequency ?? '',
    types: me.relationshipTypes ?? [],
    tags: (me.tags ?? []).join('、'),
    intro: me.intro ?? '',
    expectation: me.expectation ?? '',
  }
}

export default function Settings() {
  const { me, updateMe } = useAuth()
  const [form, setForm] = useState(() => toForm(me))
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState(null)

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))
  const toggleType = (t) =>
    set('types', form.types.includes(t) ? form.types.filter((x) => x !== t) : [...form.types, t])

  const canSave = form.nickname.trim() && form.city && form.budget && form.frequency && form.types.length > 0

  const save = async (e) => {
    e.preventDefault()
    if (!canSave || saving) return
    setSaving(true)
    setMessage(null)
    try {
      const updated = await api('/me', {
        method: 'PUT',
        body: {
          nickname: form.nickname,
          city: form.city,
          job: form.job,
          heightCm: form.heightCm === '' ? null : Number(form.heightCm),
          education: form.education || null,
          budget: form.budget,
          frequency: form.frequency,
          relationshipTypes: form.types,
          tags: form.tags.split(/[、,，\s]+/).filter(Boolean),
          intro: form.intro,
          expectation: form.expectation,
        },
      })
      updateMe(updated)
      setForm(toForm(updated))
      setMessage({ ok: true, text: '已儲存' })
    } catch (err) {
      setMessage({ ok: false, text: err.message })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="container narrow settings">
      <div className="row-between settings-head">
        <h1>編輯個人資料</h1>
        <Link to={`/member/${me.id}`} className="btn btn-ghost">查看我的個人頁</Link>
      </div>

      <PlanCard me={me} />

      <PhotoManager photos={me.photos} visibility={me.photoVisibility} onChange={updateMe} />

      <form className="settings-card" onSubmit={save}>
        <h2>基本資料</h2>
        <div className="form-grid">
          <label className="field">
            <span>暱稱</span>
            <input className="input" value={form.nickname} maxLength={20} onChange={(e) => set('nickname', e.target.value)} />
          </label>
          <label className="field">
            <span>所在地區</span>
            <select value={form.city} onChange={(e) => set('city', e.target.value)}>
              <option value="">請選擇</option>
              {CITIES.map((c) => <option key={c}>{c}</option>)}
            </select>
          </label>
          <label className="field">
            <span>職業（選填）</span>
            <input className="input" value={form.job} maxLength={30} onChange={(e) => set('job', e.target.value)} />
          </label>
          <label className="field">
            <span>身高 cm（選填）</span>
            <input className="input" type="number" min="140" max="220" value={form.heightCm} onChange={(e) => set('heightCm', e.target.value)} />
          </label>
          <label className="field">
            <span>學歷（選填）</span>
            <select value={form.education} onChange={(e) => set('education', e.target.value)}>
              <option value="">不填</option>
              {EDUCATIONS.map((x) => <option key={x}>{x}</option>)}
            </select>
          </label>
          <label className="field">
            <span>興趣（用頓號或空白分隔，最多 10 個）</span>
            <input className="input" value={form.tags} onChange={(e) => set('tags', e.target.value)} placeholder="咖啡、旅行、電影" />
          </label>
          <label className="field span-2">
            <span>關於我（選填，最多 500 字）</span>
            <textarea className="input textarea" rows="4" maxLength={500} value={form.intro} onChange={(e) => set('intro', e.target.value)} />
          </label>
        </div>

        <h2>我的期待</h2>
        <div className="field">
          <span>{me.role === 'daddy' ? '可提供的每月預算' : '期待的每月預算'}</span>
          <div className="chip-group">
            {BUDGETS.map((b) => (
              <button type="button" key={b.id} className={`chip ${form.budget === b.id ? 'chip-on' : ''}`} onClick={() => set('budget', b.id)}>
                {b.label}
              </button>
            ))}
          </div>
        </div>
        <div className="field">
          <span>見面頻率</span>
          <div className="chip-group">
            {FREQUENCIES.map((f) => (
              <button type="button" key={f} className={`chip ${form.frequency === f ? 'chip-on' : ''}`} onClick={() => set('frequency', f)}>
                {f}
              </button>
            ))}
          </div>
        </div>
        <div className="field">
          <span>關係類型（可複選）</span>
          <div className="chip-group">
            {RELATIONSHIP_TYPES.map((t) => (
              <button type="button" key={t} className={`chip ${form.types.includes(t) ? 'chip-on' : ''}`} onClick={() => toggleType(t)}>
                {t}
              </button>
            ))}
          </div>
        </div>
        <label className="field">
          <span>想對對方說的話（選填，最多 200 字）</span>
          <textarea className="input textarea" rows="3" maxLength={200} value={form.expectation} onChange={(e) => set('expectation', e.target.value)} />
        </label>

        {message && <p className={message.ok ? 'form-ok' : 'form-error'}>{message.text}</p>}
        <button type="submit" className="btn btn-primary btn-lg" disabled={!canSave || saving}>
          {saving ? '儲存中…' : '儲存'}
        </button>
      </form>
    </div>
  )
}

const PLAN_NAMES = { TRIAL: '7 天試用', MONTHLY: '尊榮 月繳', QUARTERLY: '尊榮 季繳' }

function PlanCard({ me }) {
  const m = me.membership ?? {}
  const verifiedCount = me.verified.length
  let plan
  if (m.premiumReason === 'SUBSCRIPTION') {
    plan = `${PLAN_NAMES[m.plan] ?? '尊榮'}，可使用到 ${new Date(m.endsAt).toLocaleDateString('zh-TW')}`
  } else if (m.premiumReason === 'VERIFIED') {
    plan = '認證會員（完整功能）'
  } else {
    plan = `免費會員 · 今天已喜歡 ${m.likesToday ?? 0} / ${m.likeLimit ?? '∞'} 次`
  }

  return (
    <section className="settings-card">
      <div className="row-between">
        <h2>方案與認證</h2>
        {me.role === 'daddy' ? <Link to="/pricing" className="small">查看方案</Link> : null}
      </div>
      <p className="small">{plan}</p>
      <div className="row-between">
        <span className="small muted">已完成 {verifiedCount} 項認證{me.role === 'baby' && !m.premium && '，完成真人＋身分認證即可免費使用完整功能'}</span>
        <Link to="/verify" className="btn btn-ghost">認證中心</Link>
      </div>
    </section>
  )
}

function PhotoManager({ photos, visibility, onChange }) {
  const inputRef = useRef(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const run = async (fn) => {
    setBusy(true)
    setError('')
    try {
      onChange(await fn())
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  const upload = (e) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    if (file.size > MAX_PHOTO_MB * 1024 * 1024) {
      setError(`照片不能超過 ${MAX_PHOTO_MB} MB`)
      return
    }
    const form = new FormData()
    form.append('file', file)
    run(() => api('/me/photos', { method: 'POST', form }))
  }

  const remove = (url) => {
    if (!window.confirm('確定要刪除這張照片？')) return
    run(() => api('/me/photos', { method: 'DELETE', query: { url } }))
  }

  const makeCover = (url) => run(() => api('/me/photos/cover', { method: 'PUT', query: { url } }))
  const setVisibility = (v) => run(() => api('/me/photo-visibility', { method: 'PUT', body: { visibility: v } }))

  return (
    <section className="settings-card">
      <div className="row-between">
        <h2>照片</h2>
        <span className="small muted">{photos.length} / {MAX_PHOTOS}</span>
      </div>
      <p className="small muted">第一張是大頭照。支援 JPG、PNG、WebP，每張 {MAX_PHOTO_MB} MB 以內。</p>
      <div className="photo-grid">
        {photos.map((url, i) => (
          <figure key={url} className="photo-slot">
            <img src={url} alt={`照片 ${i + 1}`} />
            {i === 0 && <span className="photo-cover">大頭照</span>}
            <figcaption>
              {i > 0 && <button type="button" className="link-btn" onClick={() => makeCover(url)} disabled={busy}>設為大頭照</button>}
              <button type="button" className="link-btn" onClick={() => remove(url)} disabled={busy}>刪除</button>
            </figcaption>
          </figure>
        ))}
        {photos.length < MAX_PHOTOS && (
          <button type="button" className="photo-slot photo-add" onClick={() => inputRef.current?.click()} disabled={busy}>
            {busy ? '上傳中…' : '＋ 新增照片'}
          </button>
        )}
      </div>
      <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp" hidden onChange={upload} />
      <div className="field visibility">
        <span>誰可以看我的照片</span>
        <label className="switch">
          <input type="radio" name="visibility" checked={visibility !== 'LIKED'} onChange={() => setVisibility('MEMBERS')} disabled={busy} />
          <span>所有會員</span>
        </label>
        <label className="switch">
          <input type="radio" name="visibility" checked={visibility === 'LIKED'} onChange={() => setVisibility('LIKED')} disabled={busy} />
          <span>只有我按過喜歡的人（其他人會看到上鎖）</span>
        </label>
      </div>
      {error && <p className="form-error" style={{ marginTop: 12 }}>{error}</p>}
    </section>
  )
}
