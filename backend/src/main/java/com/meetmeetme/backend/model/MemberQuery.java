package com.meetmeetme.backend.model;

import java.util.List;

// 探索頁的篩選條件，對應 GET /api/members 的 query string
public class MemberQuery {
    private String role;
    private String city;
    private String budget;
    private Integer maxAge;
    private List<String> types;
    private Boolean verifiedOnly;
    private Boolean onlineOnly;
    private String sort;
    private Integer size;
    private String frequency;

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }

    public String getBudget() { return budget; }
    public void setBudget(String budget) { this.budget = budget; }

    public Integer getMaxAge() { return maxAge; }
    public void setMaxAge(Integer maxAge) { this.maxAge = maxAge; }

    public List<String> getTypes() { return types; }
    public void setTypes(List<String> types) { this.types = types; }

    public Boolean getVerifiedOnly() { return verifiedOnly; }
    public void setVerifiedOnly(Boolean verifiedOnly) { this.verifiedOnly = verifiedOnly; }

    public Boolean getOnlineOnly() { return onlineOnly; }
    public void setOnlineOnly(Boolean onlineOnly) { this.onlineOnly = onlineOnly; }

    public String getSort() { return sort; }
    public void setSort(String sort) { this.sort = sort; }

    public Integer getSize() { return size; }
    public void setSize(Integer size) { this.size = size; }

    public String getFrequency() { return frequency; }
    public void setFrequency(String frequency) { this.frequency = frequency; }
}
