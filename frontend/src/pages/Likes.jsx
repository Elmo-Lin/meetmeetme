import { Link } from 'react-router-dom'
import { useAuth } from '../auth/context'
import { useApi } from '../lib/useApi'
import { MemberCard } from '../components/ui'

export default function Likes() {
  const { me } = useAuth()
  const { data, error, loading } = useApi('/me/likers')

  return (
    <div className="container explore">
      <div className="explore-head">
        <div>
          <h1>喜歡我的人</h1>
          <p className="muted">對方按了喜歡，你也喜歡的話就主動打聲招呼吧。</p>
        </div>
      </div>

      {loading && <p className="muted">載入中…</p>}
      {error && <div className="empty"><p>{error.message}</p></div>}
      {data?.locked && (
        <div className="empty locked-box">
          <p className="big-number">{data.count}</p>
          <p>{data.count > 0 ? `有 ${data.count} 位會員喜歡你` : '目前還沒有人喜歡你'}</p>
          {me.role === 'daddy' ? (
            <>
              <p className="small muted">升級尊榮會員，就能看到是誰喜歡你。</p>
              <Link to="/pricing" className="btn btn-primary">查看方案</Link>
            </>
          ) : (
            <>
              <p className="small muted">完成真人與身分認證（免費），就能看到是誰喜歡你。</p>
              <Link to="/verify" className="btn btn-primary">前往認證</Link>
            </>
          )}
        </div>
      )}
      {data && !data.locked && (
        data.items.length ? (
          <div className="member-grid">
            {data.items.map((m) => <MemberCard key={m.id} member={m} />)}
          </div>
        ) : (
          <div className="empty">
            <p>還沒有人喜歡你</p>
            <p className="small muted">放上清楚的照片、寫下你的期待，會更容易被看見。</p>
            <Link to="/settings" className="btn btn-ghost">完善個人資料</Link>
          </div>
        )
      )}
    </div>
  )
}
