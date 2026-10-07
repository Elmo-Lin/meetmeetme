package com.meetmeetme.backend.dao;

import com.meetmeetme.backend.model.Membership;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.stereotype.Repository;

import java.sql.Timestamp;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.Optional;

// 訂閱、付款與管理員身分
public interface MembershipDao {
    /** 回傳的 Membership 只有 plan 與 endsAt */
    Optional<Membership> getActiveSubscription(String me);
    boolean hasUsedTrial(String me);
    void insertSubscription(String me, String plan, Instant startsAt, Instant endsAt);
    long insertPayment(String me, String plan, int amount, String provider);
    void markPaymentPaid(long paymentId, String providerRef);
    boolean isAdmin(String me);
}

@Repository
class MembershipDaoImpl implements MembershipDao {

    @Autowired
    private NamedParameterJdbcTemplate jdbcTemplate;

    @Autowired
    private Map<String, String> sqlMap;

    @Override
    public Optional<Membership> getActiveSubscription(String me) {
        List<Membership> list = jdbcTemplate.query(sqlMap.get("getActiveSubscription"), Map.of("me", me), (rs, i) -> {
            Membership m = new Membership();
            m.setPlan(rs.getString("plan"));
            m.setEndsAt(rs.getTimestamp("ends_at").toInstant());
            return m;
        });
        return list.stream().findFirst();
    }

    @Override
    public boolean hasUsedTrial(String me) {
        Integer n = jdbcTemplate.queryForObject(sqlMap.get("countTrial"), Map.of("me", me), Integer.class);
        return n != null && n > 0;
    }

    @Override
    public void insertSubscription(String me, String plan, Instant startsAt, Instant endsAt) {
        jdbcTemplate.update(sqlMap.get("insertSubscription"),
            Map.of("me", me, "plan", plan, "startsAt", Timestamp.from(startsAt), "endsAt", Timestamp.from(endsAt)));
    }

    @Override
    public long insertPayment(String me, String plan, int amount, String provider) {
        return jdbcTemplate.queryForObject(sqlMap.get("insertPayment"),
            Map.of("me", me, "plan", plan, "amount", amount, "provider", provider), Long.class);
    }

    @Override
    public void markPaymentPaid(long paymentId, String providerRef) {
        jdbcTemplate.update(sqlMap.get("markPaymentPaid"), Map.of("id", paymentId, "providerRef", providerRef));
    }

    @Override
    public boolean isAdmin(String me) {
        Integer n = jdbcTemplate.queryForObject(sqlMap.get("isAdmin"), Map.of("me", me), Integer.class);
        return n != null && n > 0;
    }
}
