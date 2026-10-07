import { Link } from 'react-router-dom'
import { VERIFICATIONS, budgetLabel } from '../data/options'

const GRADIENTS = [
  ['#f4b6c2', '#8e4a6b'],
  ['#c9b6f4', '#4a4f8e'],
  ['#f4d6b6', '#8e6a4a'],
  ['#b6e4f4', '#3f6f8e'],
  ['#f4c2b6', '#8e3f4a'],
  ['#d7f4b6', '#4f7a4a'],
]

// 有照片用照片，沒有就用漸層 + 首字
export function Avatar({ member, size = 48, blur = false, rounded = true, src }) {
  const photo = src ?? member.photo ?? member.photos?.[0]
  const idx = member.id.split('').reduce((s, c) => s + c.charCodeAt(0), 0) % GRADIENTS.length
  const [a, b] = GRADIENTS[idx]
  return (
    <div
      className={`avatar ${blur ? 'is-blurred' : ''}`}
      style={{
        width: size, height: size,
        borderRadius: rounded ? '50%' : 'var(--radius-lg)',
        background: `linear-gradient(135deg, ${a}, ${b})`,
        // size 為 "100%" 時字級交給 CSS 決定
        fontSize: typeof size === 'number' ? size * 0.4 : undefined,
      }}
      aria-hidden="true"
    >
      {photo ? <img src={photo} alt="" loading="lazy" draggable="false" /> : <span>{member.nickname.slice(0, 1)}</span>}
    </div>
  )
}

export function VerifyBadges({ list, compact = false }) {
  return (
    <div className="badges">
      {list.map((k) => (
        <span key={k} className={`badge badge-${k}`} title={VERIFICATIONS[k].desc}>
          <CheckIcon />
          {!compact && VERIFICATIONS[k].label}
        </span>
      ))}
    </div>
  )
}

export function MemberCard({ member, blur = false }) {
  return (
    <Link to={`/member/${member.id}`} className="member-card">
      <div className="member-photo">
        <Avatar member={member} size="100%" rounded={false} blur={blur} />
        {member.demo ? <span className="demo-pill">示範帳號</span> : member.online && <span className="online-pill">● 在線</span>}
        {member.match != null && <span className="match-pill">契合 {member.match}%</span>}
        {blur && <span className="blur-hint">登入後看清楚照片</span>}
      </div>
      <div className="member-body">
        <div className="member-title">
          <strong>{member.nickname}</strong>
          <span>{member.age} · {member.city}</span>
        </div>
        {member.job && <div className="member-job">{member.job}</div>}
        <VerifyBadges list={member.verified} compact />
        <div className="member-expect">
          <span className="chip chip-soft">{budgetLabel(member.budget)}</span>
          <span className="chip chip-soft">{member.frequency}</span>
        </div>
      </div>
    </Link>
  )
}

export function CheckIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20 6 9 17l-5-5" />
    </svg>
  )
}

export function ShieldIcon({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  )
}
