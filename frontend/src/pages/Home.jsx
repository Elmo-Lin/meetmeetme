import { Link } from 'react-router-dom'
import { MemberCard, ShieldIcon, CheckIcon } from '../components/ui'
import { useAuth } from '../auth/context'
import { useApi } from '../lib/useApi'

const PAIN_POINTS = [
  {
    title: '期待先講清楚',
    body: '每位會員都要填寫預算區間、見面頻率與關係類型，聊之前就知道合不合，不用再互相試探。',
  },
  {
    title: '價格完全透明',
    body: '方案、點數、功能一頁看完，沒有隱藏收費、沒有自動加價續約。女性會員完成認證即享完整功能。',
  },
  {
    title: '認證分級看得懂',
    body: '真人、身分、財力、手機四種認證分開顯示，每一個徽章都說明審核方式，不再只有一個模糊的「VIP」。',
  },
  {
    title: '隱私由你決定',
    body: '照片預設模糊，可以只開放給你按過喜歡的人；不需交換 LINE，也能在站內語音、視訊。',
  },
]

const STEPS = [
  { n: '01', title: '選擇身分', body: '甜心 Baby 或成功人士 Daddy，3 分鐘完成註冊。' },
  { n: '02', title: '寫下期待', body: '預算、頻率、關係類型，系統依此幫你算契合度。' },
  { n: '03', title: '完成認證', body: '自拍真人比對 + 證件驗證，取得可信徽章。' },
  { n: '04', title: '安心開聊', body: '站內訊息、語音、視訊，確認合拍再見面。' },
]

export default function Home() {
  const { me } = useAuth()
  // 已登入就推薦另一種身分；未登入預設推薦甜心
  const role = me?.role === 'baby' ? 'DADDY' : 'BABY'
  const { data, loading, error } = useApi('/members', { role, sort: 'online', size: 4 }, me?.id)
  const featured = data?.items ?? []

  return (
    <>
      <section className="hero">
        <div className="container hero-grid">
          <div className="hero-copy">
            <span className="eyebrow"><ShieldIcon size={16} /> 100% 真人認證 · 18 歲以上</span>
            <h1>把期待說清楚，<br />再開始認識。</h1>
            <p className="lead">
              MeetMeetMe 是讓雙方在聊天前，就先看懂彼此期待的甜心交友平台。
              預算、頻率、關係類型一目了然，省下試探的時間，把心力留給真正合拍的人。
            </p>
            <div className="hero-actions">
              <Link to="/signup?role=baby" className="btn btn-primary btn-lg">我是甜心 Baby</Link>
              <Link to="/signup?role=daddy" className="btn btn-dark btn-lg">我是 Daddy</Link>
            </div>
            <ul className="hero-stats">
              <li><strong>48,000+</strong><span>認證會員</span></li>
              <li><strong>3 分鐘</strong><span>完成註冊</span></li>
              <li><strong>24 小時</strong><span>人工審核</span></li>
            </ul>
          </div>

          <div className="hero-visual" aria-hidden="true">
            {featured[1] && (
              <div className="hero-card hero-card-back">
                <MemberCard member={featured[1]} blur={!me} />
              </div>
            )}
            {featured[0] && (
              <div className="hero-card hero-card-front">
                <MemberCard member={featured[0]} blur={!me} />
              </div>
            )}
            <div className="hero-float">
              <span className="dot-ok"><CheckIcon /></span>
              <div>
                <strong>期待相符</strong>
                <span className="small muted">預算、頻率、關係類型 3/3</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-head">
            <span className="eyebrow">為什麼選 MeetMeetMe</span>
            <h2>其他平台讓你猜，我們讓你看清楚</h2>
          </div>
          <div className="feature-grid">
            {PAIN_POINTS.map((p, i) => (
              <article key={p.title} className="feature">
                <span className="feature-num">0{i + 1}</span>
                <h3>{p.title}</h3>
                <p>{p.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section section-tint">
        <div className="container">
          <div className="section-head row-between">
            <div>
              <span className="eyebrow">今日推薦</span>
              <h2>最近上線的會員</h2>
            </div>
            <Link to="/explore" className="btn btn-ghost">看更多會員 →</Link>
          </div>
          {loading && <p className="muted">載入中…</p>}
          {error && <p className="muted">{error.message}</p>}
          <div className="member-grid">
            {featured.map((m) => <MemberCard key={m.id} member={m} blur={!me} />)}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-head">
            <span className="eyebrow">開始的方式</span>
            <h2>四個步驟，認識對的人</h2>
          </div>
          <ol className="steps">
            {STEPS.map((s) => (
              <li key={s.n}>
                <span className="step-n">{s.n}</span>
                <h3>{s.title}</h3>
                <p>{s.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="section section-tint">
        <div className="container compare">
          <div className="section-head">
            <span className="eyebrow">誠實比較</span>
            <h2>和一般包養網有什麼不同？</h2>
          </div>
          <div className="table-wrap">
            <table className="compare-table">
              <thead>
                <tr><th></th><th>一般平台</th><th className="hl">MeetMeetMe</th></tr>
              </thead>
              <tbody>
                <tr><td>預算與頻率</td><td>聊很久才知道</td><td className="hl">個人頁直接顯示</td></tr>
                <tr><td>認證</td><td>單一 VIP 標章</td><td className="hl">四種認證分開標示</td></tr>
                <tr><td>價格</td><td>需註冊後才看得到</td><td className="hl">首頁公開、無自動加價</td></tr>
                <tr><td>照片隱私</td><td>全部公開或全部隱藏</td><td className="hl">可只對特定人開放</td></tr>
                <tr><td>聯絡方式</td><td>常被要求加 LINE</td><td className="hl">站內語音 / 視訊</td></tr>
                <tr><td>詐騙防護</td><td>事後檢舉</td><td className="hl">訊息即時風險提示</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container cta-band">
          <div>
            <h2>今天就寫下你的期待</h2>
            <p>註冊免費，女性會員完成認證即享完整功能。</p>
          </div>
          <Link to="/signup" className="btn btn-light btn-lg">免費註冊</Link>
        </div>
      </section>
    </>
  )
}
