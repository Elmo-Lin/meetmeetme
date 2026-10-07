package com.meetmeetme.backend.model;

public class ReportRequest {
    private String reason;
    private String detail;

    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }

    public String getDetail() { return detail; }
    public void setDetail(String detail) { this.detail = detail; }
}
