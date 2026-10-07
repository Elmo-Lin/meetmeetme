package com.meetmeetme.backend.model;

import java.time.Instant;

public class AdminReport {
    private Long id;
    private String reason;
    private String detail;
    private String status;
    private String action;
    private Instant createdAt;
    private Member reporter;
    private Member target;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }

    public String getDetail() { return detail; }
    public void setDetail(String detail) { this.detail = detail; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getAction() { return action; }
    public void setAction(String action) { this.action = action; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    public Member getReporter() { return reporter; }
    public void setReporter(Member reporter) { this.reporter = reporter; }

    public Member getTarget() { return target; }
    public void setTarget(Member target) { this.target = target; }
}
