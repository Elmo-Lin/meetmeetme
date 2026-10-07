package com.meetmeetme.backend.model;

// devCode 只在模擬簡訊模式回傳，方便開發測試
public class PhoneSendResponse {
    private String devCode;
    private Integer expiresInSeconds;

    public String getDevCode() { return devCode; }
    public void setDevCode(String devCode) { this.devCode = devCode; }

    public Integer getExpiresInSeconds() { return expiresInSeconds; }
    public void setExpiresInSeconds(Integer expiresInSeconds) { this.expiresInSeconds = expiresInSeconds; }
}
