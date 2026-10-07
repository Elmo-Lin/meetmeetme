package com.meetmeetme.backend.service;

// 看檔案開頭的位元組判斷格式，不相信副檔名與 Content-Type
final class ImageTypes {

    /** 回傳副檔名；不是允許的格式回傳 null */
    static String detect(byte[] b, boolean allowPdf) {
        if (b.length > 3 && (b[0] & 0xFF) == 0xFF && (b[1] & 0xFF) == 0xD8 && (b[2] & 0xFF) == 0xFF) return "jpg";
        if (b.length > 8 && (b[0] & 0xFF) == 0x89 && b[1] == 'P' && b[2] == 'N' && b[3] == 'G') return "png";
        if (b.length > 12 && b[0] == 'R' && b[1] == 'I' && b[2] == 'F' && b[3] == 'F'
                && b[8] == 'W' && b[9] == 'E' && b[10] == 'B' && b[11] == 'P') return "webp";
        if (allowPdf && b.length > 4 && b[0] == '%' && b[1] == 'P' && b[2] == 'D' && b[3] == 'F') return "pdf";
        return null;
    }

    private ImageTypes() {
    }
}
