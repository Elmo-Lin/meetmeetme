package com.meetmeetme.backend.service;

// 看檔案開頭的位元組判斷錄音格式：Chrome 錄 WebM、Safari 錄 MP4、Firefox 錄 Ogg
final class AudioTypes {

    /** 回傳副檔名；不是允許的格式回傳 null */
    static String detect(byte[] b) {
        if (b.length > 4 && (b[0] & 0xFF) == 0x1A && (b[1] & 0xFF) == 0x45 && (b[2] & 0xFF) == 0xDF && (b[3] & 0xFF) == 0xA3) return "webm";
        if (b.length > 4 && b[0] == 'O' && b[1] == 'g' && b[2] == 'g' && b[3] == 'S') return "ogg";
        if (b.length > 12 && b[4] == 'f' && b[5] == 't' && b[6] == 'y' && b[7] == 'p') return "m4a";
        return null;
    }

    private AudioTypes() {
    }
}
