package com.meetmeetme.backend.model;

import java.time.Instant;
import java.util.List;

// 認證申請；member 與 files 只在管理後台回傳
public class Verification {
    private Long id;
    private String type;
    private String status;
    private String rejectReason;
    private Instant createdAt;
    private Member member;
    private List<String> files;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getRejectReason() { return rejectReason; }
    public void setRejectReason(String rejectReason) { this.rejectReason = rejectReason; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    public Member getMember() { return member; }
    public void setMember(Member member) { this.member = member; }

    public List<String> getFiles() { return files; }
    public void setFiles(List<String> files) { this.files = files; }
}
