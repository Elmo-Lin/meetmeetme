package com.meetmeetme.backend.dao;

import com.meetmeetme.backend.model.Member;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.stereotype.Repository;

import java.sql.Types;
import java.util.List;
import java.util.Map;

// 喜歡、封鎖、檢舉
public interface SocialDao {
    void like(String me, String target);
    void unlike(String me, String target);
    void block(String me, String target);
    boolean isBlockedBetween(String a, String b);
    void report(String me, String target, String reason, String detail);
    boolean isLiked(String me, String target);
    int countLikesToday(String me);
    int countLikers(String me);
    List<Member> getLikers(String me);
}

@Repository
class SocialDaoImpl implements SocialDao {

    @Autowired
    private NamedParameterJdbcTemplate jdbcTemplate;

    @Autowired
    private Map<String, String> sqlMap;

    @Override
    public void like(String me, String target) {
        jdbcTemplate.update(sqlMap.get("insertLike"), Map.of("me", me, "target", target));
    }

    @Override
    public void unlike(String me, String target) {
        jdbcTemplate.update(sqlMap.get("deleteLike"), Map.of("me", me, "target", target));
    }

    @Override
    public void block(String me, String target) {
        jdbcTemplate.update(sqlMap.get("insertBlock"), Map.of("me", me, "target", target));
    }

    @Override
    public boolean isBlockedBetween(String a, String b) {
        Integer count = jdbcTemplate.queryForObject(sqlMap.get("countBlockBetween"), Map.of("a", a, "b", b), Integer.class);
        return count != null && count > 0;
    }

    @Override
    public void report(String me, String target, String reason, String detail) {
        MapSqlParameterSource params = new MapSqlParameterSource()
            .addValue("me", me)
            .addValue("target", target)
            .addValue("reason", reason)
            .addValue("detail", detail, Types.VARCHAR);
        jdbcTemplate.update(sqlMap.get("insertReport"), params);
    }

    @Override
    public boolean isLiked(String me, String target) {
        return count("countLiked", Map.of("me", me, "target", target)) > 0;
    }

    @Override
    public int countLikesToday(String me) {
        return count("countLikesToday", Map.of("me", me));
    }

    @Override
    public int countLikers(String me) {
        return count("countLikers", Map.of("me", me));
    }

    @Override
    public List<Member> getLikers(String me) {
        return jdbcTemplate.query(sqlMap.get("getLikers"), Map.of("me", me), MemberDaoImpl.MEMBER_MAPPER);
    }

    private int count(String key, Map<String, ?> params) {
        Integer n = jdbcTemplate.queryForObject(sqlMap.get(key), params, Integer.class);
        return n == null ? 0 : n;
    }
}
