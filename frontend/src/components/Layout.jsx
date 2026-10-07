import { useEffect, useState } from 'react'
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/context'

const NAV = [
  { to: '/explore', label: '探索會員' },
  { to: '/messages', label: '訊息' },
  { to: '/likes', label: '喜歡我的', auth: true },
  { to: '/pricing', label: '方案價格' },
  { to: '/safety', label: '安全中心' },
]

export default function Layout() {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const { me, logout } = useAuth()
  // 記住選單是在哪一頁打開的，換頁後自動視為關閉
  const [openOn, setOpenOn] = useState(null)
  const open = openOn === pathname
  const setOpen = (v) => setOpenOn(v ? pathname : null)

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  const isApp = pathname.startsWith('/messages')

  const signOut = () => {
    logout()
    navigate('/')
  }

  const actions = me ? (
    <>
      <Link to={`/member/${me.id}`} className="btn btn-ghost">{me.nickname}</Link>
      <button className="btn btn-ghost" onClick={signOut}>登出</button>
    </>
  ) : (
    <>
      <Link to="/login" className="btn btn-ghost">登入</Link>
      <Link to="/signup" className="btn btn-primary">免費註冊</Link>
    </>
  )

  return (
    <div className={`shell ${isApp ? 'shell-app' : ''}`}>
      <header className="nav">
        <div className="container nav-inner">
          <Link to="/" className="logo">
            <span className="logo-mark">M</span>
            MeetMeetMe
          </Link>
          <nav className={`nav-links ${open ? 'is-open' : ''}`}>
            {NAV.filter((n) => !n.auth || me).concat(me?.membership?.admin ? [{ to: '/admin', label: '後台' }] : []).map((n) => (
              <NavLink key={n.to} to={n.to} className={({ isActive }) => (isActive ? 'active' : '')}>
                {n.label}
              </NavLink>
            ))}
            <div className="nav-cta-mobile">{actions}</div>
          </nav>
          <div className="nav-cta">{actions}</div>
          <button className="nav-toggle" onClick={() => setOpen(!open)} aria-label="選單" aria-expanded={open}>
            <span /><span /><span />
          </button>
        </div>
      </header>

      <main>
        <Outlet />
      </main>

      {!isApp && <Footer />}
    </div>
  )
}

function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-grid">
        <div>
          <Link to="/" className="logo">
            <span className="logo-mark">M</span>
            MeetMeetMe
          </Link>
          <p className="muted small">把期待說清楚，再開始認識。<br />僅限年滿 18 歲之成年人使用。</p>
        </div>
        <div>
          <h4>平台</h4>
          <Link to="/explore">探索會員</Link>
          <Link to="/pricing">方案價格</Link>
          <Link to="/signup">免費註冊</Link>
        </div>
        <div>
          <h4>安全</h4>
          <Link to="/safety">安全中心</Link>
          <Link to="/safety#scams">常見詐騙手法</Link>
          <Link to="/safety#report">檢舉與申訴</Link>
        </div>
        <div>
          <h4>關於</h4>
          <Link to="/terms">服務條款</Link>
          <Link to="/privacy">隱私權政策</Link>
          <a href="#">聯絡客服</a>
        </div>
      </div>
      <div className="container footer-bottom small muted">
        © 2026 MeetMeetMe. 本平台嚴禁任何形式之性交易、未成年人使用及人口販運，違者將通報警方並永久停權。
      </div>
    </footer>
  )
}
