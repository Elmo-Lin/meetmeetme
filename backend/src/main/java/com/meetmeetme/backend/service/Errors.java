package com.meetmeetme.backend.service;

import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

// 錯誤訊息用中文，前端會直接顯示
final class Errors {

    static ResponseStatusException badRequest(String message) {
        return new ResponseStatusException(HttpStatus.BAD_REQUEST, message);
    }

    static ResponseStatusException unauthorized() {
        return new ResponseStatusException(HttpStatus.UNAUTHORIZED, "請先登入");
    }

    static ResponseStatusException forbidden(String message) {
        return new ResponseStatusException(HttpStatus.FORBIDDEN, message);
    }

    static ResponseStatusException notFound() {
        return new ResponseStatusException(HttpStatus.NOT_FOUND, "找不到資料");
    }

    static String requireMe(String me) {
        if (me == null) {
            throw unauthorized();
        }
        return me;
    }

    private Errors() {
    }
}
