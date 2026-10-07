package com.meetmeetme.backend.dao;

import com.meetmeetme.backend.model.Member;
import com.meetmeetme.backend.model.Verification;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.stereotype.Repository;

import java.sql.Types;
import java.util.List;
import java.util.Map;
import java.util.Optional;

// 手機驗證碼、認證申請與徽章
public interface VerificationDao {
    boolean hasRecentPhoneCode(String me);
    void savePhoneCode(String me, String phone, String codeHash);
    /** 回傳 phone、code_hash、attempts、valid */
    Optional<Map<String, Object>> getPhoneCode(String me);
    void incrementPhoneAttempts(String me);
    void deletePhoneCode(String me);
    boolean isPhoneUsedByOther(String phone, String me);
    void setPhone(String me, String phone);
    Optional<String> getPhone(String me);
    void addVerifiedBadge(String me, String type);
    void setIncomeLabel(String me, String incomeLabel);

    void insertVerification(String me, String type, List<String> files);
    boolean hasPending(String me, String type);
    /** Verification.member 只有 id，完整資料由 service 補上 */
    List<Verification> getMyVerifications(String me);
    List<Verification> getVerificationsByStatus(String status);
    Optional<Verification> getVerificationById(long id);
    boolean review(long id, String status, String reason, String admin);
}

@Repository
class VerificationDaoImpl implements VerificationDao {

    @Autowired
    private NamedParameterJdbcTemplate jdbcTemplate;

    @Autowired
    private Map<String, String> sqlMap;

    private static final RowMapper<Verification> VERIFICATION_MAPPER = (rs, rowNum) -> {
        Member member = new Member();
        member.setId(rs.getString("member_id"));
        Verification v = new Verification();
        v.setId(rs.getLong("id"));
        v.setType(rs.getString("type"));
        v.setStatus(rs.getString("status"));
        v.setRejectReason(rs.getString("reject_reason"));
        v.setCreatedAt(rs.getTimestamp("created_at").toInstant());
        v.setMember(member);
        v.setFiles(List.of((String[]) rs.getArray("files").getArray()));
        return v;
    };

    @Override
    public boolean hasRecentPhoneCode(String me) {
        return count("countRecentPhoneCode", Map.of("me", me)) > 0;
    }

    @Override
    public void savePhoneCode(String me, String phone, String codeHash) {
        jdbcTemplate.update(sqlMap.get("upsertPhoneCode"), Map.of("me", me, "phone", phone, "codeHash", codeHash));
    }

    @Override
    public Optional<Map<String, Object>> getPhoneCode(String me) {
        return jdbcTemplate.queryForList(sqlMap.get("getPhoneCode"), Map.of("me", me)).stream().findFirst();
    }

    @Override
    public void incrementPhoneAttempts(String me) {
        jdbcTemplate.update(sqlMap.get("incrementPhoneAttempts"), Map.of("me", me));
    }

    @Override
    public void deletePhoneCode(String me) {
        jdbcTemplate.update(sqlMap.get("deletePhoneCode"), Map.of("me", me));
    }

    @Override
    public boolean isPhoneUsedByOther(String phone, String me) {
        return count("countPhoneUsedByOther", Map.of("phone", phone, "me", me)) > 0;
    }

    @Override
    public void setPhone(String me, String phone) {
        jdbcTemplate.update(sqlMap.get("setPhone"), Map.of("me", me, "phone", phone));
    }

    @Override
    public Optional<String> getPhone(String me) {
        return jdbcTemplate.queryForList(sqlMap.get("getPhone"), Map.of("me", me), String.class).stream()
            .filter(java.util.Objects::nonNull).findFirst();
    }

    @Override
    public void addVerifiedBadge(String me, String type) {
        jdbcTemplate.update(sqlMap.get("addVerifiedBadge"), Map.of("me", me, "type", type));
    }

    @Override
    public void setIncomeLabel(String me, String incomeLabel) {
        jdbcTemplate.update(sqlMap.get("setIncomeLabel"), Map.of("me", me, "incomeLabel", incomeLabel));
    }

    @Override
    public void insertVerification(String me, String type, List<String> files) {
        jdbcTemplate.update(sqlMap.get("insertVerification"), Map.of("me", me, "type", type, "files", String.join(",", files)));
    }

    @Override
    public boolean hasPending(String me, String type) {
        return count("countPendingVerification", Map.of("me", me, "type", type)) > 0;
    }

    @Override
    public List<Verification> getMyVerifications(String me) {
        return jdbcTemplate.query(sqlMap.get("getMyVerifications"), Map.of("me", me), VERIFICATION_MAPPER);
    }

    @Override
    public List<Verification> getVerificationsByStatus(String status) {
        return jdbcTemplate.query(sqlMap.get("getVerificationsByStatus"), Map.of("status", status), VERIFICATION_MAPPER);
    }

    @Override
    public Optional<Verification> getVerificationById(long id) {
        return jdbcTemplate.query(sqlMap.get("getVerificationById"), Map.of("id", id), VERIFICATION_MAPPER).stream().findFirst();
    }

    @Override
    public boolean review(long id, String status, String reason, String admin) {
        MapSqlParameterSource params = new MapSqlParameterSource()
            .addValue("id", id)
            .addValue("status", status)
            .addValue("reason", reason, Types.VARCHAR)
            .addValue("admin", admin);
        return jdbcTemplate.update(sqlMap.get("reviewVerification"), params) > 0;
    }

    private int count(String key, Map<String, ?> params) {
        Integer n = jdbcTemplate.queryForObject(sqlMap.get(key), params, Integer.class);
        return n == null ? 0 : n;
    }
}
