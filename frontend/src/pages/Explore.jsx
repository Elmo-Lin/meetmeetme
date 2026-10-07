import { useState } from 'react'
import { CITIES, BUDGETS, RELATIONSHIP_TYPES } from '../data/options'
import { MemberCard } from '../components/ui'
import { useAuth } from '../auth/context'
import { useApi, useDebounced } from '../lib/useApi'

const SORTS = [
  { id: 'match', label: '契合度' },
  { id: 'online', label: '最近上線' },
]

const NO_AGE_LIMIT = 60

export default function Explore() {
  const { me } = useAuth()
  // 使用者還沒手動切換前，預設看另一種身分（登入資料可能晚一點才載入）
  const [pickedRole, setRole] = useState(null)
  const role = pickedRole ?? (me?.role === 'baby' ? 'daddy' : 'baby')
  const [city, setCity] = useState('')
  const [budget, setBudget] = useState('')
  const [types, setTypes] = useState([])
  const [ageMax, setAgeMax] = useState(NO_AGE_LIMIT)
  const [verifiedOnly, setVerifiedOnly] = useState(false)
  const [onlineOnly, setOnlineOnly] = useState(false)
  const [sort, setSort] = useState('match')
  const [showFilters, setShowFilters] = useState(false)

  // 拖動年齡滑桿時不要每一格都打 API
  const maxAge = useDebounced(ageMax === NO_AGE_LIMIT ? undefined : ageMax)
  const { data, loading, error } = useApi('/members', {
    role: role.toUpperCase(), city, budget, maxAge, types, verifiedOnly, onlineOnly,
    sort: me ? sort : 'online', size: 60,
  }, me?.id)
  const results = data?.items ?? []

  const toggleType = (t) =>
    setTypes((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]))

  const reset = () => {
    setCity(''); setBudget(''); setTypes([]); setAgeMax(NO_AGE_LIMIT); setVerifiedOnly(false); setOnlineOnly(false)
  }

  return (
    <div className="container explore">
      <div className="explore-head">
        <div>
          <h1>探索會員</h1>
          <p className="muted">用期待篩選，不再一個一個問。</p>
        </div>
        <div className="segmented" role="tablist">
          <button className={role === 'baby' ? 'active' : ''} onClick={() => setRole('baby')}>甜心 Baby</button>
          <button className={role === 'daddy' ? 'active' : ''} onClick={() => setRole('daddy')}>Daddy</button>
        </div>
      </div>

      <div className="explore-layout">
        <aside className={`filters ${showFilters ? 'is-open' : ''}`}>
          <div className="filters-head">
            <strong>篩選條件</strong>
            <button className="link-btn" onClick={reset}>清除</button>
          </div>

          <label className="field">
            <span>地區</span>
            <select value={city} onChange={(e) => setCity(e.target.value)}>
              <option value="">全部地區</option>
              {CITIES.map((c) => <option key={c}>{c}</option>)}
            </select>
          </label>

          <label className="field">
            <span>預算區間</span>
            <select value={budget} onChange={(e) => setBudget(e.target.value)}>
              <option value="">不限</option>
              {BUDGETS.map((b) => <option key={b.id} value={b.id}>{b.label}</option>)}
            </select>
          </label>

          <div className="field">
            <span>年齡上限：{ageMax === NO_AGE_LIMIT ? '不限' : `${ageMax} 歲`}</span>
            <input type="range" min="18" max={NO_AGE_LIMIT} value={ageMax} onChange={(e) => setAgeMax(Number(e.target.value))} />
          </div>

          <div className="field">
            <span>關係類型</span>
            <div className="chip-group">
              {RELATIONSHIP_TYPES.map((t) => (
                <button key={t} className={`chip ${types.includes(t) ? 'chip-on' : ''}`} onClick={() => toggleType(t)}>
                  {t}
                </button>
              ))}
            </div>
          </div>

          <label className="switch">
            <input type="checkbox" checked={verifiedOnly} onChange={(e) => setVerifiedOnly(e.target.checked)} />
            <span>只看已身分認證</span>
          </label>
          <label className="switch">
            <input type="checkbox" checked={onlineOnly} onChange={(e) => setOnlineOnly(e.target.checked)} />
            <span>只看在線上</span>
          </label>

          <button className="btn btn-primary btn-block filters-done" onClick={() => setShowFilters(false)}>
            顯示 {results.length} 位會員
          </button>
        </aside>

        <section>
          <div className="results-bar">
            <button className="btn btn-ghost filters-toggle" onClick={() => setShowFilters(true)}>篩選</button>
            <span className="muted small">{loading ? '搜尋中…' : `共 ${results.length} 位會員`}</span>
            {me && (
              <label className="sort">
                <span className="small muted">排序</span>
                <select value={sort} onChange={(e) => setSort(e.target.value)}>
                  {SORTS.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
                </select>
              </label>
            )}
          </div>

          {error ? (
            <div className="empty"><p>{error.message}</p></div>
          ) : results.length ? (
            <div className={`member-grid ${loading ? 'is-loading' : ''}`}>
              {results.map((m) => <MemberCard key={m.id} member={m} blur={!me} />)}
            </div>
          ) : !loading && (
            <div className="empty">
              <p>沒有符合條件的會員</p>
              <button className="btn btn-ghost" onClick={reset}>清除篩選</button>
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
