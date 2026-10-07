ALTER TABLE members
    ADD COLUMN is_admin         BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN banned_at        TIMESTAMPTZ,
    ADD COLUMN phone            TEXT,
    -- MEMBERS：所有可看照片的會員；LIKED：只有我按過喜歡的人
    ADD COLUMN photo_visibility TEXT NOT NULL DEFAULT 'MEMBERS' CHECK (photo_visibility IN ('MEMBERS', 'LIKED'));

-- 一個手機號碼只能認證一個帳號
CREATE UNIQUE INDEX members_phone_key ON members (phone) WHERE phone IS NOT NULL;

-- 新欄位只能加在 view 最後面
CREATE OR REPLACE VIEW member_view AS
SELECT id,
       LOWER(role)                                     AS role,
       nickname,
       EXTRACT(YEAR FROM AGE(birth_date))::int         AS age,
       city, job, height_cm, education, budget, frequency,
       relationship_types, verified, photos, tags,
       income_label, expectation, intro, demo,
       last_active_at > NOW() - INTERVAL '5 minutes'   AS online,
       last_active_at,
       photo_visibility,
       banned_at IS NOT NULL                           AS banned
FROM members;

-- 手機驗證碼（只存雜湊）
CREATE TABLE phone_codes (
    member_id  TEXT PRIMARY KEY REFERENCES members (id),
    phone      TEXT        NOT NULL,
    code_hash  TEXT        NOT NULL,
    attempts   INT         NOT NULL DEFAULT 0,
    sent_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL
);

-- 真人 / 身分 / 財力認證申請；files 為私密檔案的 key，不對外公開
CREATE TABLE verification_requests (
    id            BIGSERIAL PRIMARY KEY,
    member_id     TEXT        NOT NULL REFERENCES members (id),
    type          TEXT        NOT NULL CHECK (type IN ('photo', 'id', 'income')),
    status        TEXT        NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED')),
    files         TEXT[]      NOT NULL,
    reject_reason TEXT,
    reviewed_by   TEXT REFERENCES members (id),
    reviewed_at   TIMESTAMPTZ,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
-- 同一種認證同時只能有一筆審核中
CREATE UNIQUE INDEX verification_requests_pending_key ON verification_requests (member_id, type) WHERE status = 'PENDING';
CREATE INDEX verification_requests_status_idx ON verification_requests (status, created_at);

-- 訂閱：每買一次加一段期間，接在目前到期日後面
CREATE TABLE subscriptions (
    id         BIGSERIAL PRIMARY KEY,
    member_id  TEXT        NOT NULL REFERENCES members (id),
    plan       TEXT        NOT NULL CHECK (plan IN ('TRIAL', 'MONTHLY', 'QUARTERLY')),
    starts_at  TIMESTAMPTZ NOT NULL,
    ends_at    TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX subscriptions_member_idx ON subscriptions (member_id, ends_at DESC);

CREATE TABLE payments (
    id           BIGSERIAL PRIMARY KEY,
    member_id    TEXT        NOT NULL REFERENCES members (id),
    plan         TEXT        NOT NULL,
    amount       INT         NOT NULL,
    provider     TEXT        NOT NULL,
    provider_ref TEXT,
    status       TEXT        NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'PAID', 'FAILED')),
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    paid_at      TIMESTAMPTZ
);

-- 檢舉處理結果
ALTER TABLE reports
    ADD COLUMN action      TEXT,
    ADD COLUMN resolved_by TEXT REFERENCES members (id),
    ADD COLUMN resolved_at TIMESTAMPTZ;

-- 每日喜歡次數用
CREATE INDEX likes_from_created_idx ON likes (from_id, created_at);
CREATE INDEX likes_to_idx ON likes (to_id, created_at DESC);
