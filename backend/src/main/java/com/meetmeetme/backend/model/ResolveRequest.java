package com.meetmeetme.backend.model;

// DISMISS：不成立；BAN：停權被檢舉人
public class ResolveRequest {
    private String action;

    public String getAction() { return action; }
    public void setAction(String action) { this.action = action; }
}
