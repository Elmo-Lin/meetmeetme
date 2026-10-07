-- 個人頁需要的欄位
ALTER TABLE members
    ADD COLUMN height_cm    INT,
    ADD COLUMN education    TEXT,
    ADD COLUMN income_label TEXT,
    ADD COLUMN expectation  TEXT,
    ADD COLUMN intro        TEXT,
    ADD COLUMN tags         TEXT[] NOT NULL DEFAULT '{}';

-- 對外顯示用：年齡、在線狀態、小寫身分都在這裡算好
CREATE VIEW member_view AS
SELECT id,
       LOWER(role)                                     AS role,
       nickname,
       EXTRACT(YEAR FROM AGE(birth_date))::int         AS age,
       city, job, height_cm, education, budget, frequency,
       relationship_types, verified, photos, tags,
       income_label, expectation, intro, demo,
       last_active_at > NOW() - INTERVAL '5 minutes'   AS online,
       last_active_at
FROM members;

-- 登入帳號；示範會員沒有帳號
CREATE TABLE accounts (
    member_id     TEXT PRIMARY KEY REFERENCES members (id),
    email         TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL
);

-- 登入憑證：只存 token 的雜湊
CREATE TABLE sessions (
    token_hash TEXT PRIMARY KEY,
    member_id  TEXT        NOT NULL REFERENCES members (id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL
);

CREATE TABLE likes (
    from_id    TEXT REFERENCES members (id),
    to_id      TEXT REFERENCES members (id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (from_id, to_id)
);

CREATE TABLE blocks (
    from_id    TEXT REFERENCES members (id),
    to_id      TEXT REFERENCES members (id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (from_id, to_id)
);

CREATE TABLE reports (
    id          BIGSERIAL PRIMARY KEY,
    reporter_id TEXT        NOT NULL REFERENCES members (id),
    target_id   TEXT        NOT NULL REFERENCES members (id),
    reason      TEXT        NOT NULL,
    detail      TEXT,
    status      TEXT        NOT NULL DEFAULT 'OPEN',
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 一對會員只會有一個對話（id 小的放 member_low）
CREATE TABLE conversations (
    id              BIGSERIAL PRIMARY KEY,
    member_low      TEXT        NOT NULL REFERENCES members (id),
    member_high     TEXT        NOT NULL REFERENCES members (id),
    last_message_id BIGINT,
    last_message_at TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CHECK (member_low < member_high),
    UNIQUE (member_low, member_high)
);

CREATE TABLE conversation_participants (
    conversation_id      BIGINT REFERENCES conversations (id),
    member_id            TEXT REFERENCES members (id),
    last_read_message_id BIGINT NOT NULL DEFAULT 0,
    PRIMARY KEY (conversation_id, member_id)
);
CREATE INDEX conversation_participants_member_idx ON conversation_participants (member_id);

CREATE TABLE messages (
    id              BIGSERIAL PRIMARY KEY,
    conversation_id BIGINT      NOT NULL REFERENCES conversations (id),
    sender_id       TEXT        NOT NULL REFERENCES members (id),
    body            TEXT        NOT NULL CHECK (LENGTH(body) <= 2000),
    risk_flagged    BOOLEAN     NOT NULL DEFAULT false,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX messages_conversation_idx ON messages (conversation_id, id);

-- 補齊示範會員的個人頁資料（與前端 mockServer 相同）
UPDATE members SET height_cm = 162, education = '碩士', tags = '{咖啡,展覽,電影}',
    expectation = '希望是穩定、彼此尊重的關係，先從吃飯聊天開始。', intro = '喜歡咖啡廳和展覽，週末常去看電影。' WHERE id = 'yuna';
UPDATE members SET height_cm = 168, education = '大學', tags = '{旅行,攝影,美食}',
    expectation = '想找可以一起旅行、聊得來的人。', intro = '愛旅行、愛拍照，去過 12 個國家。' WHERE id = 'mia';
UPDATE members SET height_cm = 165, education = '大學', tags = '{健身,網球,咖啡}',
    expectation = '重視溝通，希望彼此坦誠。', intro = '下班喜歡去健身房，最近在學網球。' WHERE id = 'ivy';
UPDATE members SET height_cm = 178, education = '碩士', tags = '{紅酒,爵士,登山}', income_label = '年收 300 萬以上',
    expectation = '工作忙，希望找個能好好聊天、互相陪伴的人。', intro = '喜歡紅酒和爵士樂，假日會去爬山。' WHERE id = 'leo';
UPDATE members SET height_cm = 175, education = '大學', tags = '{高爾夫,美食,旅行}', income_label = '年收 500 萬以上',
    expectation = '常出差，想找旅伴一起去日本、東南亞。', intro = '熱愛美食與高爾夫。' WHERE id = 'kevin';
UPDATE members SET height_cm = 176, education = '碩士', tags = '{料理,露營,咖啡}',
    expectation = '希望找個能一起吃飯、分享生活的人。', intro = '喜歡做菜和露營。' WHERE id = 'eric';

INSERT INTO members (id, role, nickname, birth_date, city, job, height_cm, education, budget, frequency,
                     relationship_types, verified, photos, tags, income_label, expectation, intro, demo, last_active_at) VALUES
('qing',   'BABY',  '小晴',   '2002-04-18', '新北市', '大學生',       158, '大學', 'b1', '每月 2–3 次', '{導師型,飯局 / 聊天}', '{photo,id}',
 '{/seed/qing-1.jpg,/seed/qing-2.jpg,/seed/qing-3.jpg}', '{設計,甜點,貓}', NULL,
 '希望認識在職場上有經驗的人，可以給我一些建議。', '主修設計，正在準備作品集。', true, NOW() - INTERVAL '3 hours'),
('sandy',  'BABY',  'Sandy',  '1998-02-25', '桃園市', '空服員',       170, '大學', 'b3', '彈性安排', '{旅伴,飯局 / 聊天}', '{photo,phone}',
 '{}', '{旅行,調酒,語言}', NULL, '班表不固定，希望對方能配合彈性時間。', '喜歡探索各城市的小酒館。', false, NOW() - INTERVAL '15 minutes'),
('yuyu',   'BABY',  '雨雨',   '2003-06-09', '台南市', '大學生',       156, '大學', 'b1', '每月 2–3 次', '{飯局 / 聊天,導師型}', '{id}',
 '{}', '{古著,電影,閱讀}', NULL, '先當朋友聊聊天，合得來再說。', '喜歡古著和老電影。', false, NOW() - INTERVAL '10 hours'),
('howard', 'DADDY', 'Howard', '1976-08-03', '台中市', '建設公司經理', 172, '大學', 'b4', '每週 2–3 次', '{長期穩定,導師型}', '{photo,income}',
 '{}', '{古典樂,茶,閱讀}', '年收 800 萬以上', '希望關係穩定、彼此信任。', '平常喜歡聽古典樂、品茶。', false, NOW() - INTERVAL '4 hours'),
('jason',  'DADDY', 'Jason',  '1983-12-11', '台北市', '律師',         180, '碩士', 'b3', '每月 2–3 次', '{飯局 / 聊天,旅伴}', '{photo,id,income,phone}',
 '{}', '{潛水,攝影,紅酒}', '年收 300 萬以上', '工作壓力大，想找能輕鬆聊天的對象。', '喜歡潛水和攝影。', false, NOW() - INTERVAL '50 minutes');
