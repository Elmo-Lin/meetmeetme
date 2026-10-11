package com.meetmeetme.backend.model;

import java.time.Instant;

public class Message {
    private Long id;
    private String body;
    private Boolean riskFlagged;
    private Instant createdAt;
    private Boolean mine;
    /** 語音訊息的秒數；文字訊息為 null */
    private Integer audioDurationSec;

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

    public Integer getAudioDurationSec() { return audioDurationSec; }
    public void setAudioDurationSec(Integer audioDurationSec) { this.audioDurationSec = audioDurationSec; }
}
