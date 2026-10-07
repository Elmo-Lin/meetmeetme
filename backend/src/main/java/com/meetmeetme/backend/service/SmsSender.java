package com.meetmeetme.backend.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

/**
 * 簡訊。目前是模擬發送：只寫進後端 log，不會真的寄出。
 * 之後換成三竹、Twilio 等簡訊商時，新增一個實作取代這個類別即可。
 */
public interface SmsSender {
    void send(String phone, String text);
}

@Service
class LogSmsSender implements SmsSender {

    private static final Logger log = LoggerFactory.getLogger(LogSmsSender.class);

    @Override
    public void send(String phone, String text) {
        log.info("[模擬簡訊] 寄給 {}：{}", phone, text);
    }
}
