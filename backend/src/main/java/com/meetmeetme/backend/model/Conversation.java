package com.meetmeetme.backend.model;

import java.time.Instant;

// 對話列表的一列；id 用字串，前端會拿來和網址參數比對
public class Conversation {
    private String id;
    private Member member;
    private String lastMessage;
    private Instant lastMessageAt;
    private Integer unread;
    private Long otherReadUpTo;

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public Member getMember() { return member; }
    public void setMember(Member member) { this.member = member; }

    public String getLastMessage() { return lastMessage; }
    public void setLastMessage(String lastMessage) { this.lastMessage = lastMessage; }

    public Instant getLastMessageAt() { return lastMessageAt; }
    public void setLastMessageAt(Instant lastMessageAt) { this.lastMessageAt = lastMessageAt; }

    public Integer getUnread() { return unread; }
    public void setUnread(Integer unread) { this.unread = unread; }

    public Long getOtherReadUpTo() { return otherReadUpTo; }
    public void setOtherReadUpTo(Long otherReadUpTo) { this.otherReadUpTo = otherReadUpTo; }
}
