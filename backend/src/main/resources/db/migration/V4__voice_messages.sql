-- 語音訊息：音檔存在私有儲存空間，body 留空字串
ALTER TABLE messages
    ADD COLUMN audio_key          TEXT,
    ADD COLUMN audio_duration_sec INT CHECK (audio_duration_sec BETWEEN 1 AND 60);
