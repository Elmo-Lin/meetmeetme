import { useState } from 'react'
import { ShieldIcon } from '../components/ui'

const SCAMS = [
  { title: '投資 / 博弈帶路', sign: '聊沒幾天就分享「穩賺」的投資平台或博弈網站，要你先小額試試。' },
  { title: '車馬費、保證金', sign: '見面前要求先匯「誠意金」、「車馬費」或購買點數卡證明實力。' },
  { title: '急著加 LINE', sign: '一開始就要求轉到外部通訊軟體，避開平台的風險偵測。' },
  { title: '假冒客服', sign: '自稱平台客服，要你提供帳密或點擊連結「解凍帳號」。MeetMeetMe 客服不會私訊索取密碼。' },
  { title: '照片盜用', sign: '照片過於專業、拒絕任何視訊，或說法前後矛盾。' },
]

const TIPS = [
  '第一次見面請約在公開場所，並讓朋友知道你的行程',
  '先用站內視訊確認對方是照片本人',
  '不要提供身分證、存摺、住址等個人資料',
  '任何要求先付款的情況，一律拒絕並檢舉',
  '感到不舒服可以隨時離開、隨時封鎖',
]

const QUIZ = [
  { q: '對方說想見面，但要先轉 2,000 元「車馬費」證明誠意。', scam: true },
  { q: '對方希望先在站內視訊 5 分鐘，確認彼此是本人。', scam: false },
  { q: '對方說他是平台客服，請你點連結重新驗證帳號。', scam: true },
  { q: '對方建議第一次約在百貨公司的咖啡廳見面。', scam: false },
]

export default function Safety() {
  const [answers, setAnswers] = useState({})

  return (
    <div className="safety">
      <section className="safety-hero">
        <div className="container">
          <span className="eyebrow"><ShieldIcon size={16} /> 安全中心</span>
          <h1>安全，是認識彼此的前提</h1>
          <p className="lead">我們用認證、即時偵測與人工審核三道防線把關，也教你自己辨認風險。</p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="layers">
            <article>
              <h3>第一道：註冊認證</h3>
              <p>證件驗證年滿 18 歲、即時自拍比對照片本人，未通過認證無法傳送訊息。</p>
            </article>
            <article>
              <h3>第二道：訊息偵測</h3>
              <p>當訊息出現匯款、儲值、外部連結等字眼時，雙方都會即時看到風險提示。</p>
            </article>
            <article>
              <h3>第三道：人工審核</h3>
              <p>檢舉 24 小時內由真人處理，確認違規即永久停權，並保留資料配合警方調查。</p>
            </article>
          </div>
        </div>
      </section>

      <section className="section section-tint" id="scams">
        <div className="container two-col">
          <div>
            <h2>常見詐騙手法</h2>
            <ul className="scam-list">
              {SCAMS.map((s) => (
                <li key={s.title}>
                  <strong>{s.title}</strong>
                  <p>{s.sign}</p>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h2>見面前的 5 個習慣</h2>
            <ol className="tip-list">
              {TIPS.map((t) => <li key={t}>{t}</li>)}
            </ol>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container narrow">
          <h2>小測驗：這是詐騙嗎？</h2>
          <div className="quiz">
            {QUIZ.map((item, i) => {
              const a = answers[i]
              const correct = a !== undefined && a === item.scam
              return (
                <div key={i} className="quiz-item">
                  <p>{item.q}</p>
                  <div className="quiz-actions">
                    <button className="chip" onClick={() => setAnswers({ ...answers, [i]: true })}>是詐騙</button>
                    <button className="chip" onClick={() => setAnswers({ ...answers, [i]: false })}>沒問題</button>
                  </div>
                  {a !== undefined && (
                    <p className={`quiz-result ${correct ? 'ok' : 'bad'}`}>
                      {correct ? '答對了！' : '再想想。'}
                      {item.scam ? '這是常見的詐騙手法。' : '這是安全的做法。'}
                    </p>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </section>

      <section className="section section-tint" id="report">
        <div className="container narrow">
          <h2>檢舉與申訴</h2>
          <p>在任何會員頁或對話中點選「檢舉」，選擇原因並附上截圖即可。我們會在 24 小時內回覆處理結果。</p>
          <p className="muted small">
            若遇到緊急人身安全危險，請立即撥打 110。疑似詐騙可撥打 165 反詐騙專線。
            本平台嚴禁未成年人使用、性交易及任何形式之人口販運，相關情事將直接通報主管機關。
          </p>
        </div>
      </section>
    </div>
  )
}
