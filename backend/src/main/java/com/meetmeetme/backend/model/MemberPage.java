package com.meetmeetme.backend.model;

import java.util.List;

// 前端預期列表包在 items 裡
public class MemberPage {
    private List<Member> items;

    public MemberPage(List<Member> items) { this.items = items; }

    public List<Member> getItems() { return items; }
    public void setItems(List<Member> items) { this.items = items; }
}
