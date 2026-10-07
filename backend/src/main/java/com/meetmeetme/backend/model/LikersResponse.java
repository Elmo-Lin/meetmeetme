package com.meetmeetme.backend.model;

import java.util.List;

// 免費會員只看得到人數（locked = true，items 為空）
public class LikersResponse {
    private Integer count;
    private Boolean locked;
    private List<Member> items;

    public Integer getCount() { return count; }
    public void setCount(Integer count) { this.count = count; }

    public Boolean getLocked() { return locked; }
    public void setLocked(Boolean locked) { this.locked = locked; }

    public List<Member> getItems() { return items; }
    public void setItems(List<Member> items) { this.items = items; }
}
