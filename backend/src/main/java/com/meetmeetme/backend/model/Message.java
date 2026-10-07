package com.meetmeetme.backend.model;

import java.time.Instant;

public class Message {
    private Long id;
    private String body;
    private Boolean riskFlagged;
    private Instant createdAt;
    private Boolean mine;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getBody() { return body; }
    public void setBody(String body) { this.body = body; }

    public Boolean getRiskFlagged() { return riskFlagged; }
    public void setRiskFlagged(Boolean riskFlagged) { this.riskFlagged = riskFlagged; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    public Boolean getMine() { return mine; }
    public void setMine(Boolean mine) { this.mine = mine; }
}
