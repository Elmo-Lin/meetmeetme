CREATE TABLE members (
    id                 TEXT PRIMARY KEY,
    role               TEXT        NOT NULL CHECK (role IN ('BABY', 'DADDY')),
    nickname           TEXT        NOT NULL,
    birth_date         DATE        NOT NULL,
    city               TEXT        NOT NULL,
    job                TEXT,
    budget             TEXT        NOT NULL,
    frequency          TEXT        NOT NULL,
    relationship_types TEXT[]      NOT NULL DEFAULT '{}',
    verified           TEXT[]      NOT NULL DEFAULT '{}',
    photos             TEXT[]      NOT NULL DEFAULT '{}',
    demo               BOOLEAN     NOT NULL DEFAULT false,
    last_active_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_at         TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX members_role_active_idx ON members (role, last_active_at DESC);

-- 與前端 mockServer 相同的示範資料
INSERT INTO members (id, role, nickname, birth_date, city, job, budget, frequency, relationship_types, verified, photos, demo, last_active_at) VALUES
('yuna',  'BABY',  'Yuna',  '2001-03-12', '台北市', '研究生',         'b2', '每週 1 次',   '{長期穩定,飯局 / 聊天}', '{photo,id,phone}',        '{/seed/yuna-1.jpg,/seed/yuna-2.jpg,/seed/yuna-3.jpg}', true,  now()),
('mia',   'BABY',  'Mia',   '1999-07-02', '台中市', '平面模特兒',     'b3', '每週 2–3 次', '{旅伴,短期體驗}',        '{photo,phone}',           '{/seed/mia-1.jpg,/seed/mia-2.jpg,/seed/mia-3.jpg}',    true,  now() - interval '35 minutes'),
('ivy',   'BABY',  'Ivy',   '2000-11-20', '台北市', '行銷企劃',       'b2', '每週 1 次',   '{長期穩定}',             '{photo,id,phone}',        '{}',                                                   false, now()),
('leo',   'DADDY', 'Leo',   '1985-05-08', '台北市', '科技業主管',     'b3', '每週 1 次',   '{長期穩定,旅伴}',        '{photo,id,income,phone}', '{/seed/leo-1.jpg,/seed/leo-2.jpg}',                    true,  now()),
('kevin', 'DADDY', 'Kevin', '1980-09-15', '高雄市', '貿易公司負責人', 'b4', '彈性安排',    '{旅伴,飯局 / 聊天}',     '{photo,income,phone}',    '{/seed/kevin-1.jpg,/seed/kevin-2.jpg}',                true,  now() - interval '90 minutes'),
('eric',  'DADDY', 'Eric',  '1988-01-30', '新竹市', '工程師',         'b2', '每週 1 次',   '{長期穩定,飯局 / 聊天}', '{photo,id,phone}',        '{}',                                                   false, now());
