-- 圖片訊息：圖片存在私有儲存空間，body 留空字串
ALTER TABLE messages ADD COLUMN image_key TEXT;
