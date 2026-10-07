package com.meetmeetme.backend.model;

// 核准財力認證時要指定 incomeLabel；退件時填 reason
public class ReviewRequest {
    private String incomeLabel;
    private String reason;

    public String getIncomeLabel() { return incomeLabel; }
    public void setIncomeLabel(String incomeLabel) { this.incomeLabel = incomeLabel; }

    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }
}
