package com.meetmeetme.backend.model;

// 登入用，只在後端內部使用，不會回傳給前端
public class Account {
    private String memberId;
    private String passwordHash;
    private Boolean banned;

    public String getMemberId() { return memberId; }
    public void setMemberId(String memberId) { this.memberId = memberId; }

    public String getPasswordHash() { return passwordHash; }
    public void setPasswordHash(String passwordHash) { this.passwordHash = passwordHash; }

    public Boolean getBanned() { return banned; }
    public void setBanned(Boolean banned) { this.banned = banned; }
}
