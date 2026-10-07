import { useState } from 'react'
import { Link } from 'react-router-dom'
import { CheckIcon } from '../components/ui'
import { useAuth } from '../auth/context'
import { api } from '../lib/api'

const PLANS = {
  daddy: [
    {
      name: '基本', price: 0, period: '免費',
      features: ['瀏覽會員（照片模糊）', '每日 3 次喜歡', '回覆他人訊息'],
      cta: '免費註冊',
    },
    {
      name: '尊榮', price: 1680, period: '/ 月', highlight: true, plan: 'MONTHLY',
      features: ['無限傳送訊息', '查看完整照片（對方允許時）', '站內語音、視訊', '看誰喜歡你', '已讀回條', '進階篩選：預算、頻率'],
      cta: '開始 7 天試用',
    },
    {
      name: '尊榮 季繳', price: 4380, period: '/ 3 個月', note: '每月 $1,460，省 13%', plan: 'QUARTERLY',
      features: ['包含所有尊榮功能', '每月 1 次個人頁置頂', '專屬客服'],
      cta: '選擇季繳',
    },
  ],
  baby: [
    {
      name: '基本', price: 0, period: '免費',
      features: ['瀏覽所有會員', '每日 10 次喜歡', '回覆所有訊息'],
      cta: '免費註冊',
    },
    {
      name: '認證會員', price: 0, period: '完成認證即享', highlight: true,
      features: ['完成真人 + 身分認證即開通', '無限傳送訊息', '站內語音、視訊', '看誰喜歡你', '照片可見度自訂'],
      cta: '註冊並認證',
    },
  ],
}

const FAQ = [
  ['會自動續約嗎？', '月繳方案到期前 3 天會以 Email 與站內通知提醒，你可以隨時在設定中一鍵取消，取消後仍可用到期滿。'],
  ['帳單上會顯示什麼名稱？', '信用卡帳單將顯示中性的公司名稱，不會出現平台名稱或相關字眼。'],
  ['可以退款嗎？', '7 天試用期內取消不收費。付費後 48 小時內未使用付費功能可全額退款。'],
  ['為什麼女性會員免費？', '我們希望用認證而非付費來把關品質：完成真人與身分認證的女性會員即可使用完整功能，假帳號因此大幅減少。'],
]

const PLAN_NAMES = { TRIAL: '7 天試用', MONTHLY: '尊榮 月繳', QUARTERLY: '尊榮 季繳' }

function dateLabel(iso) {
  const d = new Date(iso)
  return `${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()}`
}

export default function Pricing() {
  const { me, refreshMe } = useAuth()
  const [pickedRole, setRole] = useState(null)
  const role = pickedRole ?? me?.role ?? 'daddy'
  const plans = PLANS[role]
  const membership = me?.membership
  const [busy, setBusy] = useState(false)
  const [notice, setNotice] = useState(null)

  // 目前是模擬付款，一律成功、不會真的扣款
  const buy = async (plan, price) => {
    const text = plan === 'TRIAL'
      ? '開始 7 天免費試用？'
      : `這是模擬付款，不會真的扣款。\n確定購買「${PLAN_NAMES[plan]}」NT$${price.toLocaleString()}？`
    if (!window.confirm(text)) return
    setBusy(true)
    setNotice(null)
    try {
      const m = await api('/billing/checkout', { method: 'POST', body: { plan } })
      await refreshMe()
      setNotice({ ok: true, text: `已開通${PLAN_NAMES[plan]}，可使用到 ${dateLabel(m.endsAt)}` })
    } catch (err) {
      setNotice({ ok: false, text: err.message })
    } finally {
      setBusy(false)
    }
  }

  // 依登入狀態決定每張方案卡的按鈕
  const action = (p) => {
    const cls = `btn btn-block ${p.highlight ? 'btn-primary' : 'btn-ghost'}`
    if (!me || me.role !== role) return <Link to={`/signup?role=${role}`} className={cls}>{p.cta}</Link>
    if (role === 'baby') {
      if (p.price === 0 && !p.highlight) {
        return <button className={cls} disabled>{membership?.premium ? '基本功能' : '目前方案'}</button>
      }
      return membership?.premium
        ? <button className={cls} disabled>已開通</button>
        : <Link to="/verify" className={cls}>前往認證</Link>
    }
    if (!p.plan) return <button className={cls} disabled>{membership?.premium ? '基本功能' : '目前方案'}</button>
    const plan = p.plan === 'MONTHLY' && !membership?.trialUsed ? 'TRIAL' : p.plan
    const label = plan === 'TRIAL' ? '開始 7 天試用' : membership?.premium ? '續訂' : p.plan === 'MONTHLY' ? '購買月繳' : p.cta
    return <button className={cls} onClick={() => buy(plan, p.price)} disabled={busy}>{label}</button>
  }

  return (
    <div className="container pricing">
      <div className="section-head center">
        <span className="eyebrow">方案價格</span>
        <h1>價格公開，沒有隱藏收費</h1>
        <p className="muted">不用註冊就能看清楚。隨時取消，不綁約。</p>
        {me?.role === 'daddy' && membership?.plan && (
          <p className="form-ok">目前方案：{PLAN_NAMES[membership.plan]}，可使用到 {dateLabel(membership.endsAt)}</p>
        )}
        {me?.role === 'baby' && membership?.premium && <p className="form-ok">你已完成認證，可以使用完整功能</p>}
        {notice && <p className={notice.ok ? 'form-ok' : 'form-error'}>{notice.text}</p>}
        <div className="segmented">
          <button className={role === 'daddy' ? 'active' : ''} onClick={() => setRole('daddy')}>Daddy 方案</button>
          <button className={role === 'baby' ? 'active' : ''} onClick={() => setRole('baby')}>甜心 Baby 方案</button>
        </div>
      </div>

      <div className={`plan-grid plans-${plans.length}`}>
        {plans.map((p) => (
          <article key={p.name} className={`plan ${p.highlight ? 'plan-hl' : ''}`}>
            {p.highlight && <span className="plan-tag">最多人選擇</span>}
            <h3>{p.name}</h3>
            <div className="plan-price">
              {p.price > 0 ? <><span className="cur">NT$</span>{p.price.toLocaleString()}</> : <>NT$0</>}
              <span className="per">{p.period}</span>
            </div>
            {p.note && <p className="small plan-note">{p.note}</p>}
            <ul>
              {p.features.map((f) => <li key={f}><CheckIcon /> {f}</li>)}
            </ul>
            {action(p)}
          </article>
        ))}
      </div>

      <section className="faq">
        <h2>常見問題</h2>
        {FAQ.map(([q, a]) => (
          <details key={q}>
            <summary>{q}</summary>
            <p>{a}</p>
          </details>
        ))}
      </section>
    </div>
  )
}
