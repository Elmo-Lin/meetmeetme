package com.meetmeetme.backend.model;

import java.time.Instant;

// 目前登入者的方案與權益，只出現在 /api/me
// premiumReason：SUBSCRIPTION（Daddy 付費）或 VERIFIED（Baby 完成真人 + 身分認證）；likeLimit 為 null 表示無限制
public class Membership {
    private Boolean premium;
    private String premiumReason;
    private String plan;
    private Instant endsAt;
    private Boolean trialUsed;
    private Integer likeLimit;
    private Integer likesToday;
    private Boolean admin;

    public Boolean getPremium() { return premium; }
    public void setPremium(Boolean premium) { this.premium = premium; }

    public String getPremiumReason() { return premiumReason; }
    public void setPremiumReason(String premiumReason) { this.premiumReason = premiumReason; }

    public String getPlan() { return plan; }
    public void setPlan(String plan) { this.plan = plan; }

    public Instant getEndsAt() { return endsAt; }
    public void setEndsAt(Instant endsAt) { this.endsAt = endsAt; }

    public Boolean getTrialUsed() { return trialUsed; }
    public void setTrialUsed(Boolean trialUsed) { this.trialUsed = trialUsed; }

    public Integer getLikeLimit() { return likeLimit; }
    public void setLikeLimit(Integer likeLimit) { this.likeLimit = likeLimit; }

    public Integer getLikesToday() { return likesToday; }
    public void setLikesToday(Integer likesToday) { this.likesToday = likesToday; }

    public Boolean getAdmin() { return admin; }
    public void setAdmin(Boolean admin) { this.admin = admin; }
}
