// 靜態網站版的「後端」：所有資料存在瀏覽器 localStorage，只有自己看得到
const DB_KEY = 'meetmeetme.db'
const RISK_WORDS = ['匯款', '轉帳', '儲值', '點數卡', '投資', '保證金', '車馬費', '誠意金', 'line', 'http']

const MIN = 60 * 1000

// ago：距今幾分鐘前上線；online 為 true 時忽略
const SEED = [
  {
    id: 'yuna', role: 'baby', nickname: 'Yuna', birthYear: 2001, city: '台北市', job: '研究生', heightCm: 162, education: '碩士',
    verified: ['photo', 'id', 'phone'], budget: 'b2', frequency: '每週 1 次', relationshipTypes: ['長期穩定', '飯局 / 聊天'],
    expectation: '希望是穩定、彼此尊重的關係，先從吃飯聊天開始。', intro: '喜歡咖啡廳和展覽，週末常去看電影。',
    tags: ['咖啡', '展覽', '電影'], photos: ['/seed/yuna-1.jpg', '/seed/yuna-2.jpg', '/seed/yuna-3.jpg'], online: true, demo: true,
  },
  {
    id: 'mia', role: 'baby', nickname: 'Mia', birthYear: 1999, city: '台中市', job: '平面模特兒', heightCm: 168, education: '大學',
    verified: ['photo', 'phone'], budget: 'b3', frequency: '每週 2–3 次', relationshipTypes: ['旅伴', '短期體驗'],
    expectation: '想找可以一起旅行、聊得來的人。', intro: '愛旅行、愛拍照，去過 12 個國家。',
    tags: ['旅行', '攝影', '美食'], photos: ['/seed/mia-1.jpg', '/seed/mia-2.jpg', '/seed/mia-3.jpg'], ago: 35, demo: true,
  },
  {
    id: 'qing', role: 'baby', nickname: '小晴', birthYear: 2002, city: '新北市', job: '大學生', heightCm: 158, education: '大學',
    verified: ['photo', 'id'], budget: 'b1', frequency: '每月 2–3 次', relationshipTypes: ['導師型', '飯局 / 聊天'],
    expectation: '希望認識在職場上有經驗的人，可以給我一些建議。', intro: '主修設計，正在準備作品集。',
    tags: ['設計', '甜點', '貓'], photos: ['/seed/qing-1.jpg', '/seed/qing-2.jpg', '/seed/qing-3.jpg'], ago: 180, demo: true,
  },
  {
    id: 'leo', role: 'daddy', nickname: 'Leo', birthYear: 1985, city: '台北市', job: '科技業主管', heightCm: 178, education: '碩士',
    verified: ['photo', 'id', 'income', 'phone'], budget: 'b3', frequency: '每週 1 次', relationshipTypes: ['長期穩定', '旅伴'],
    incomeLabel: '年收 300 萬以上', expectation: '工作忙，希望找個能好好聊天、互相陪伴的人。', intro: '喜歡紅酒和爵士樂，假日會去爬山。',
    tags: ['紅酒', '爵士', '登山'], photos: ['/seed/leo-1.jpg', '/seed/leo-2.jpg'], online: true, demo: true,
  },
  {
    id: 'kevin', role: 'daddy', nickname: 'Kevin', birthYear: 1980, city: '高雄市', job: '貿易公司負責人', heightCm: 175, education: '大學',
    verified: ['photo', 'income', 'phone'], budget: 'b4', frequency: '彈性安排', relationshipTypes: ['旅伴', '飯局 / 聊天'],
    incomeLabel: '年收 500 萬以上', expectation: '常出差，想找旅伴一起去日本、東南亞。', intro: '熱愛美食與高爾夫。',
    tags: ['高爾夫', '美食', '旅行'], photos: ['/seed/kevin-1.jpg', '/seed/kevin-2.jpg'], ago: 90, demo: true,
  },
  {
    id: 'ivy', role: 'baby', nickname: 'Ivy', birthYear: 2000, city: '台北市', job: '行銷企劃', heightCm: 165, education: '大學',
    verified: ['photo', 'id', 'phone'], budget: 'b2', frequency: '每週 1 次', relationshipTypes: ['長期穩定'],
    expectation: '重視溝通，希望彼此坦誠。', intro: '下班喜歡去健身房，最近在學網球。', tags: ['健身', '網球', '咖啡'], online: true,
  },
  {
    id: 'sandy', role: 'baby', nickname: 'Sandy', birthYear: 1998, city: '桃園市', job: '空服員', heightCm: 170, education: '大學',
    verified: ['photo', 'phone'], budget: 'b3', frequency: '彈性安排', relationshipTypes: ['旅伴', '飯局 / 聊天'],
    expectation: '班表不固定，希望對方能配合彈性時間。', intro: '喜歡探索各城市的小酒館。', tags: ['旅行', '調酒', '語言'], ago: 15,
  },
  {
    id: 'yuyu', role: 'baby', nickname: '雨雨', birthYear: 2003, city: '台南市', job: '大學生', heightCm: 156, education: '大學',
    verified: ['id'], budget: 'b1', frequency: '每月 2–3 次', relationshipTypes: ['飯局 / 聊天', '導師型'],
    expectation: '先當朋友聊聊天，合得來再說。', intro: '喜歡古著和老電影。', tags: ['古著', '電影', '閱讀'], ago: 600,
  },
  {
    id: 'eric', role: 'daddy', nickname: 'Eric', birthYear: 1988, city: '新竹市', job: '工程師', heightCm: 176, education: '碩士',
    verified: ['photo', 'id', 'phone'], budget: 'b2', frequency: '每週 1 次', relationshipTypes: ['長期穩定', '飯局 / 聊天'],
    expectation: '希望找個能一起吃飯、分享生活的人。', intro: '喜歡做菜和露營。', tags: ['料理', '露營', '咖啡'], online: true,
  },
  {
    id: 'howard', role: 'daddy', nickname: 'Howard', birthYear: 1976, city: '台中市', job: '建設公司經理', heightCm: 172, education: '大學',
    verified: ['photo', 'income'], budget: 'b4', frequency: '每週 2–3 次', relationshipTypes: ['長期穩定', '導師型'],
    incomeLabel: '年收 800 萬以上', expectation: '希望關係穩定、彼此信任。', intro: '平常喜歡聽古典樂、品茶。', tags: ['古典樂', '茶', '閱讀'], ago: 240,
  },
  {
    id: 'jason', role: 'daddy', nickname: 'Jason', birthYear: 1983, city: '台北市', job: '律師', heightCm: 180, education: '碩士',
    verified: ['photo', 'id', 'income', 'phone'], budget: 'b3', frequency: '每月 2–3 次', relationshipTypes: ['飯局 / 聊天', '旅伴'],
    incomeLabel: '年收 300 萬以上', expectation: '工作壓力大，想找能輕鬆聊天的對象。', intro: '喜歡潛水和攝影。', tags: ['潛水', '攝影', '紅酒'], ago: 50,
  },
]

let memory = null

function seedMembers() {
  const now = Date.now()
  return SEED.map(({ ago, ...m }) => ({
    photos: [], tags: [], verified: [], online: false, demo: false,
    ...m,
    lastActiveAt: new Date(now - (ago ?? 0) * MIN).toISOString(),
  }))
}

function load() {
  if (memory) return memory
  try {
    const raw = localStorage.getItem(DB_KEY)
    if (raw) memory = JSON.parse(raw)
  } catch { /* 無痕模式等 */ }
  memory ??= { members: seedMembers(), accounts: {}, likes: {}, blocks: {}, conversations: [], messages: [], seq: 0 }
  return memory
}

function save() {
  try { localStorage.setItem(DB_KEY, JSON.stringify(memory)) } catch { /* ignore */ }
}

function fail(status, message) {
  const err = new Error(message)
  err.status = status
  throw err
}

function ageOf(m) {
  if (m.birthDate) {
    const b = new Date(m.birthDate)
    const now = new Date()
    let age = now.getFullYear() - b.getFullYear()
    if (now < new Date(now.getFullYear(), b.getMonth(), b.getDate())) age--
    return age
  }
  return new Date().getFullYear() - m.birthYear
}

function matchScore(me, m) {
  let score = 40
  if (me.budget === m.budget) score += 20
  if (me.frequency === m.frequency) score += 15
  const shared = me.relationshipTypes.filter((t) => m.relationshipTypes.includes(t)).length
  score += Math.min(shared * 10, 20)
  const tags = (me.tags ?? []).filter((t) => m.tags.includes(t)).length
  score += Math.min(tags * 5, 5)
  return Math.min(score, 99)
}

function view(db, m, me) {
  const rest = { ...m }
  delete rest.birthYear
  delete rest.birthDate
  return {
    ...rest,
    age: ageOf(m),
    match: me && me.id !== m.id ? matchScore(me, m) : null,
    liked: !!me && (db.likes[me.id] ?? []).includes(m.id),
  }
}

function blockedBetween(db, a, b) {
  return (db.blocks[a] ?? []).includes(b) || (db.blocks[b] ?? []).includes(a)
}

async function hash(text) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text))
  return [...new Uint8Array(buf)].map((x) => x.toString(16).padStart(2, '0')).join('')
}

function findMember(db, id, me) {
  const m = db.members.find((x) => x.id === id)
  if (!m || (me && blockedBetween(db, me.id, id))) fail(404, '找不到資料')
  return m
}

function requireMe(me) {
  if (!me) fail(401, '請先登入')
  return me
}

function threadView(db, c, me) {
  const otherId = c.members.find((id) => id !== me.id)
  const msgs = db.messages.filter((x) => x.conv === c.id)
  const last = msgs[msgs.length - 1]
  return {
    id: c.id,
    member: view(db, db.members.find((x) => x.id === otherId), me),
    lastMessage: last?.body ?? null,
    lastMessageAt: last?.createdAt ?? c.createdAt,
    unread: msgs.filter((x) => x.from !== me.id && x.id > (c.read?.[me.id] ?? 0)).length,
  }
}

const routes = [
  ['POST', /^\/auth\/signup$/, async (db, _me, { body }) => {
    const email = body.email.trim().toLowerCase()
    if (db.accounts[email]) fail(409, '這個 Email 已經註冊過了')
    const draft = { birthDate: body.birthDate }
    if (Number.isNaN(new Date(body.birthDate).getTime()) || ageOf(draft) < 18) fail(400, '未滿 18 歲無法註冊')
    const id = `u${Date.now().toString(36)}`
    const member = {
      id, role: body.role.toLowerCase(), nickname: body.nickname.trim(), birthDate: body.birthDate, city: body.city,
      budget: body.budget, frequency: body.frequency, relationshipTypes: body.relationshipTypes,
      verified: [], photos: [], tags: [], online: true, demo: false, lastActiveAt: new Date().toISOString(),
    }
    db.members.push(member)
    db.accounts[email] = { id, password: await hash(body.password) }
    return { token: id, member: view(db, member, member) }
  }],
  ['POST', /^\/auth\/login$/, async (db, _me, { body }) => {
    const account = db.accounts[body.email.trim().toLowerCase()]
    if (!account || account.password !== await hash(body.password)) fail(400, 'Email 或密碼錯誤')
    const member = db.members.find((x) => x.id === account.id)
    return { token: member.id, member: view(db, member, member) }
  }],
  ['GET', /^\/me$/, (db, me) => view(db, requireMe(me), me)],
  ['GET', /^\/members$/, (db, me, { query }) => {
    const q = query ?? {}
    let list = db.members.filter((m) =>
      m.id !== me?.id && !(me && blockedBetween(db, me.id, m.id))
      && (!q.role || m.role === q.role.toLowerCase())
      && (!q.city || m.city === q.city)
      && (!q.budget || m.budget === q.budget)
      && (!q.maxAge || ageOf(m) <= Number(q.maxAge))
      && (!q.types?.length || q.types.some((t) => m.relationshipTypes.includes(t)))
      && (!q.verifiedOnly || m.verified.includes('id'))
      && (!q.onlineOnly || m.online))
      .map((m) => view(db, m, me))
    const byOnline = (a, b) => (b.online - a.online) || (new Date(b.lastActiveAt) - new Date(a.lastActiveAt))
    list.sort(q.sort === 'match' && me ? (a, b) => (b.match - a.match) || byOnline(a, b) : byOnline)
    if (q.size) list = list.slice(0, Number(q.size))
    return { items: list }
  }],
  ['GET', /^\/members\/([^/]+)$/, (db, me, _o, id) => view(db, findMember(db, id, me), me)],
  ['PUT', /^\/members\/([^/]+)\/like$/, (db, me, _o, id) => {
    requireMe(me)
    findMember(db, id, me)
    const list = db.likes[me.id] ??= []
    if (!list.includes(id)) list.push(id)
    return null
  }],
  ['DELETE', /^\/members\/([^/]+)\/like$/, (db, me, _o, id) => {
    requireMe(me)
    db.likes[me.id] = (db.likes[me.id] ?? []).filter((x) => x !== id)
    return null
  }],
  ['PUT', /^\/members\/([^/]+)\/block$/, (db, me, _o, id) => {
    requireMe(me)
    findMember(db, id, me)
    const list = db.blocks[me.id] ??= []
    if (!list.includes(id)) list.push(id)
    return null
  }],
  ['POST', /^\/members\/([^/]+)\/report$/, (db, me, _o, id) => {
    requireMe(me)
    findMember(db, id, me)
    return null
  }],
  ['GET', /^\/conversations$/, (db, me) => {
    requireMe(me)
    return db.conversations
      .filter((c) => c.members.includes(me.id) && !blockedBetween(db, ...c.members))
      .map((c) => threadView(db, c, me))
      .sort((a, b) => new Date(b.lastMessageAt) - new Date(a.lastMessageAt))
  }],
  ['POST', /^\/conversations$/, (db, me, { body }) => {
    requireMe(me)
    const other = findMember(db, body.memberId, me)
    if (other.demo && !me.demo) fail(403, '示範帳號無法傳訊')
    if (other.role === me.role) fail(403, '只能與不同身分的會員聊天')
    let c = db.conversations.find((x) => x.members.includes(me.id) && x.members.includes(other.id))
    if (!c) {
      c = { id: `c${++db.seq}`, members: [me.id, other.id], createdAt: new Date().toISOString(), read: {} }
      db.conversations.push(c)
    }
    return { id: c.id }
  }],
  ['GET', /^\/conversations\/([^/]+)\/messages$/, (db, me, { query }, id) => {
    requireMe(me)
    const c = db.conversations.find((x) => x.id === id && x.members.includes(me.id))
    if (!c) fail(404, '找不到資料')
    const after = Number(query?.after ?? 0)
    const msgs = db.messages.filter((x) => x.conv === id)
    if (msgs.length) (c.read ??= {})[me.id] = msgs[msgs.length - 1].id
    return msgs.filter((x) => x.id > after).map((x) => ({
      id: x.id, body: x.body, createdAt: x.createdAt, riskFlagged: x.riskFlagged, mine: x.from === me.id,
    }))
  }],
  ['POST', /^\/conversations\/([^/]+)\/messages$/, (db, me, { body }, id) => {
    requireMe(me)
    const c = db.conversations.find((x) => x.id === id && x.members.includes(me.id))
    if (!c || blockedBetween(db, ...c.members)) fail(404, '找不到資料')
    const text = body.body.trim()
    if (!text) fail(400, '訊息不能是空白')
    const msg = {
      id: ++db.seq, conv: id, from: me.id, body: text, createdAt: new Date().toISOString(),
      riskFlagged: RISK_WORDS.some((w) => text.toLowerCase().includes(w)),
    }
    db.messages.push(msg)
    ;(c.read ??= {})[me.id] = msg.id
    return { id: msg.id, body: msg.body, createdAt: msg.createdAt, riskFlagged: msg.riskFlagged, mine: true }
  }],
]

export async function handle(method, path, { body, query, token }) {
  const db = load()
  const me = token ? db.members.find((x) => x.id === token) ?? null : null
  for (const [m, re, fn] of routes) {
    const hit = m === method && path.match(re)
    if (!hit) continue
    const result = await fn(db, me, { body, query }, ...hit.slice(1).map(decodeURIComponent))
    if (method !== 'GET' || path.includes('/messages')) save()
    // 回傳複本，避免頁面改到「資料庫」本身
    return result == null ? null : structuredClone(result)
  }
  fail(404, '找不到資料')
}
