package com.meetmeetme.backend.model;

import java.util.List;

// 我的認證狀態
public class VerificationStatus {
    private Boolean phoneVerified;
    private String phone;
    private List<Verification> requests;

    public Boolean getPhoneVerified() { return phoneVerified; }
    public void setPhoneVerified(Boolean phoneVerified) { this.phoneVerified = phoneVerified; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public List<Verification> getRequests() { return requests; }
    public void setRequests(List<Verification> requests) { this.requests = requests; }
}
