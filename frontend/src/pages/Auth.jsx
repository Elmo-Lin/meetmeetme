import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { CITIES, BUDGETS, FREQUENCIES, RELATIONSHIP_TYPES } from '../data/options'
import { useAuth } from '../auth/context'
import { ShieldIcon, CheckIcon } from '../components/ui'

const STEPS = ['身分', '基本資料', '我的期待', '認證']

export function Signup() {
  const [params] = useSearchParams()
  const { signup } = useAuth()
  const [step, setStep] = useState(0)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({
    role: params.get('role') || '',
    nickname: '', birth: '', city: '', email: '', password: '', adult: false,
    budget: '', frequency: '', types: [],
  })
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))
  const toggleType = (t) =>
    set('types', form.types.includes(t) ? form.types.filter((x) => x !== t) : [...form.types, t])

  const canNext = [
    !!form.role,
    form.nickname && form.birth && form.city && form.email && form.password.length >= 8 && form.adult,
    form.budget && form.frequency && form.types.length > 0,
    true,
  ][step]

  const next = async (e) => {
    e.preventDefault()
    if (!canNext || submitting) return
    setError('')
    // 填完期待就建立帳號，最後一步是認證
    if (step === 2) {
      setSubmitting(true)
      try {
        await signup({
          email: form.email,
          password: form.password,
          role: form.role.toUpperCase(),
          nickname: form.nickname,
          birthDate: form.birth,
          city: form.city,
          budget: form.budget,
          frequency: form.frequency,
          relationshipTypes: form.types,
          acceptTerms: form.adult,
        })
      } catch (err) {
        setError(err.message)
        // 帳號資料的問題（年齡、Email 重複）要回到上一步改
        if (err.status === 400 || err.status === 409) setStep(1)
        return
      } finally {
        setSubmitting(false)
      }
    }
    setStep(step + 1)
  }

  return (
    <div className="auth">
      <div className="auth-card">
        <ol className="progress">
          {STEPS.map((s, i) => (
            <li key={s} className={i < step ? 'done' : i === step ? 'current' : ''}>
              <span>{i < step ? <CheckIcon /> : i + 1}</span>
              {s}
            </li>
          ))}
        </ol>

        <form onSubmit={next}>
          {step === 0 && (
            <>
              <h1>你想以什麼身分加入？</h1>
              <p className="muted">身分註冊後無法更改，請依實際情況選擇。</p>
              <div className="role-pick">
                <button type="button" className={form.role === 'baby' ? 'active' : ''} onClick={() => set('role', 'baby')}>
                  <strong>甜心 Baby</strong>
                  <span>想認識有經驗、有品味的對象</span>
                  <em>完成認證即免費使用完整功能</em>
                </button>
                <button type="button" className={form.role === 'daddy' ? 'active' : ''} onClick={() => set('role', 'daddy')}>
                  <strong>Daddy</strong>
                  <span>事業有成，想找聊得來的陪伴</span>
                  <em>可申請財力認證，提升可信度</em>
                </button>
              </div>
            </>
          )}

          {step === 1 && (
            <>
              <h1>基本資料</h1>
              <p className="muted">暱稱會公開顯示，其他資料僅用於驗證。</p>
              <div className="form-grid">
                <label className="field">
                  <span>暱稱</span>
                  <input className="input" value={form.nickname} onChange={(e) => set('nickname', e.target.value)} placeholder="不建議使用真名" />
                </label>
                <label className="field">
                  <span>出生日期</span>
                  <input className="input" type="date" value={form.birth} onChange={(e) => set('birth', e.target.value)} />
                </label>
                <label className="field">
                  <span>所在地區</span>
                  <select value={form.city} onChange={(e) => set('city', e.target.value)}>
                    <option value="">請選擇</option>
                    {CITIES.map((c) => <option key={c}>{c}</option>)}
                  </select>
                </label>
                <label className="field">
                  <span>Email</span>
                  <input className="input" type="email" value={form.email} onChange={(e) => set('email', e.target.value)} />
                </label>
                <label className="field span-2">
                  <span>密碼（至少 8 碼）</span>
                  <input className="input" type="password" value={form.password} onChange={(e) => set('password', e.target.value)} />
                </label>
              </div>
              <label className="switch">
                <input type="checkbox" checked={form.adult} onChange={(e) => set('adult', e.target.checked)} />
                <span>我已年滿 18 歲，並同意<Link to="/terms" target="_blank">服務條款</Link>與<Link to="/privacy" target="_blank">隱私權政策</Link></span>
              </label>
            </>
          )}

          {step === 2 && (
            <>
              <h1>寫下你的期待</h1>
              <p className="muted">這是 MeetMeetMe 最重要的一步：會顯示在你的個人頁，幫你過濾不合適的人。</p>
              <div className="field">
                <span>{form.role === 'daddy' ? '可提供的每月預算' : '期待的每月預算'}</span>
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
            </>
          )}

          {step === 3 && (
            <>
              <h1>註冊完成！最後一步：完成認證</h1>
              <p className="muted">認證資料加密保存，不會公開，只會在個人頁顯示徽章。{form.role === 'baby' && '完成真人＋身分認證即可免費使用完整功能。'}</p>
              <ul className="verify-steps">
                <li>
                  <ShieldIcon />
                  <div><strong>手機認證</strong><span className="small muted">簡訊驗證碼，30 秒完成</span></div>
                </li>
                <li>
                  <ShieldIcon />
                  <div><strong>真人認證</strong><span className="small muted">依指示做一個動作自拍</span></div>
                </li>
                <li>
                  <ShieldIcon />
                  <div><strong>身分認證</strong><span className="small muted">上傳證件確認已滿 18 歲</span></div>
                </li>
                {form.role === 'daddy' && (
                  <li>
                    <ShieldIcon />
                    <div><strong>財力認證（選填）</strong><span className="small muted">薪資單 / 扣繳憑單 / 存款證明</span></div>
                  </li>
                )}
              </ul>
              <Link to="/verify" className="btn btn-primary btn-block btn-lg">開始認證</Link>
              <Link to="/settings" className="btn btn-ghost btn-block">先上傳照片、完善個人資料</Link>
              <Link to="/explore" className="btn btn-ghost btn-block">先去逛逛，稍後再說</Link>
            </>
          )}

          {error && <p className="form-error" style={{ marginTop: 16 }}>{error}</p>}

          {step < 3 && (
            <div className="auth-actions">
              {step > 0 && <button type="button" className="btn btn-ghost" onClick={() => { setError(''); setStep(step - 1) }}>上一步</button>}
              <button type="submit" className="btn btn-primary grow" disabled={!canNext || submitting}>
                {step === 2 ? (submitting ? '建立帳號中…' : '建立帳號') : '下一步'}
              </button>
            </div>
          )}
        </form>

        {step < 3 && <p className="small muted center">已經有帳號？<Link to="/login">登入</Link></p>}
      </div>
    </div>
  )
}

export function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  // 只接受站內路徑，避免被拿來導到外部網站
  const nextParam = params.get('next')
  const next = nextParam?.startsWith('/') && !nextParam.startsWith('//') ? nextParam : '/explore'

  const submit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    try {
      await login(email, password)
      navigate(next, { replace: true })
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="auth">
      <div className="auth-card narrow-card">
        <h1>歡迎回來</h1>
        <p className="muted">登入後即可查看完整照片與訊息。</p>
        <form onSubmit={submit}>
          <label className="field">
            <span>Email</span>
            <input className="input" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </label>
          <label className="field">
            <span>密碼</span>
            <input className="input" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </label>
          <div className="row-between small">
            <label className="switch"><input type="checkbox" defaultChecked /> <span>保持登入</span></label>
            <a href="#">忘記密碼？</a>
          </div>
          {error && <p className="form-error" style={{ marginTop: 12 }}>{error}</p>}
          <button type="submit" className="btn btn-primary btn-block btn-lg" disabled={submitting}>
            {submitting ? '登入中…' : '登入'}
          </button>
        </form>
        <div className="divider"><span>或</span></div>
        <button className="btn btn-ghost btn-block" disabled title="即將推出">使用 Google 登入</button>
        <button className="btn btn-ghost btn-block" disabled title="即將推出">使用 Apple 登入</button>
        <p className="small muted center">還沒有帳號？<Link to="/signup">免費註冊</Link></p>
      </div>
    </div>
  )
}
