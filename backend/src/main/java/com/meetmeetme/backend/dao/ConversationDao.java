package com.meetmeetme.backend.dao;

import com.meetmeetme.backend.model.Conversation;
import com.meetmeetme.backend.model.Member;
import com.meetmeetme.backend.model.Message;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.Optional;

// 對話與訊息
public interface ConversationDao {
    long createConversation(String low, String high);
    void addParticipant(long conversationId, String memberId);
    Optional<String> getOtherMemberId(long conversationId, String me);
    /** 回傳的 Conversation 只有 member.id，完整資料由 service 補上 */
    List<Conversation> getConversations(String me);
    List<Message> getMessagesAfter(long conversationId, String me, long after);
    Message insertMessage(long conversationId, String me, String body, boolean riskFlagged);
    void updateLastMessage(long conversationId, long messageId, Instant createdAt);
    void markRead(long conversationId, String me);
    boolean hasMessageFromOther(long conversationId, String me);
}

@Repository
class ConversationDaoImpl implements ConversationDao {

    @Autowired
    private NamedParameterJdbcTemplate jdbcTemplate;

    @Autowired
    private Map<String, String> sqlMap;

    private static final RowMapper<Message> MESSAGE_MAPPER = (rs, rowNum) -> {
        Message m = new Message();
        m.setId(rs.getLong("id"));
        m.setBody(rs.getString("body"));
        m.setRiskFlagged(rs.getBoolean("risk_flagged"));
        m.setCreatedAt(rs.getTimestamp("created_at").toInstant());
        m.setMine(rs.getBoolean("mine"));
        return m;
    };

    private static final RowMapper<Conversation> CONVERSATION_MAPPER = (rs, rowNum) -> {
        Member other = new Member();
        other.setId(rs.getString("other_id"));
        Conversation c = new Conversation();
        c.setId(String.valueOf(rs.getLong("id")));
        c.setMember(other);
        c.setLastMessage(rs.getString("last_message"));
        c.setLastMessageAt(rs.getTimestamp("last_message_at").toInstant());
        c.setUnread(rs.getInt("unread"));
        c.setOtherReadUpTo(rs.getLong("other_read_up_to"));
        return c;
    };

    @Override
    public long createConversation(String low, String high) {
        Map<String, Object> params = Map.of("low", low, "high", high);
        jdbcTemplate.update(sqlMap.get("insertConversation"), params);
        return jdbcTemplate.queryForObject(sqlMap.get("getConversationId"), params, Long.class);
    }

    @Override
    public void addParticipant(long conversationId, String memberId) {
        jdbcTemplate.update(sqlMap.get("insertParticipant"), Map.of("conversationId", conversationId, "memberId", memberId));
    }

    @Override
    public Optional<String> getOtherMemberId(long conversationId, String me) {
        List<String> list = jdbcTemplate.queryForList(sqlMap.get("getOtherMemberId"),
            Map.of("conversationId", conversationId, "me", me), String.class);
        return list.stream().findFirst();
    }

    @Override
    public List<Conversation> getConversations(String me) {
        return jdbcTemplate.query(sqlMap.get("getConversations"), Map.of("me", me), CONVERSATION_MAPPER);
    }

    @Override
    public List<Message> getMessagesAfter(long conversationId, String me, long after) {
        return jdbcTemplate.query(sqlMap.get("getMessagesAfter"),
            Map.of("conversationId", conversationId, "me", me, "after", after), MESSAGE_MAPPER);
    }

    @Override
    public Message insertMessage(long conversationId, String me, String body, boolean riskFlagged) {
        return jdbcTemplate.queryForObject(sqlMap.get("insertMessage"),
            Map.of("conversationId", conversationId, "me", me, "body", body, "riskFlagged", riskFlagged), MESSAGE_MAPPER);
    }

    @Override
    public void updateLastMessage(long conversationId, long messageId, Instant createdAt) {
        jdbcTemplate.update(sqlMap.get("updateLastMessage"),
            Map.of("conversationId", conversationId, "messageId", messageId, "createdAt", java.sql.Timestamp.from(createdAt)));
    }

    @Override
    public void markRead(long conversationId, String me) {
        jdbcTemplate.update(sqlMap.get("markRead"), Map.of("conversationId", conversationId, "me", me));
    }

    @Override
    public boolean hasMessageFromOther(long conversationId, String me) {
        Integer n = jdbcTemplate.queryForObject(sqlMap.get("countMessagesFromOther"),
            Map.of("conversationId", conversationId, "me", me), Integer.class);
        return n != null && n > 0;
    }
}
