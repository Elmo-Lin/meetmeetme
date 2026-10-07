package com.meetmeetme.backend.dao;

import com.meetmeetme.backend.model.Member;
import com.meetmeetme.backend.model.MemberQuery;
import com.meetmeetme.backend.model.ProfileRequest;
import com.meetmeetme.backend.model.SignupRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.stereotype.Repository;

import java.sql.Array;
import java.sql.SQLException;
import java.sql.Types;
import java.util.List;
import java.util.Map;
import java.util.Optional;

public interface MemberDao {
    List<Member> getMembers(MemberQuery query, String me, int limit);
    Optional<Member> getMemberById(String id, String me);
    void insertMember(String id, SignupRequest req);
    void touchMember(String id);
    void updateProfile(String me, ProfileRequest req);
    boolean appendPhoto(String me, String url, int max);
    boolean removePhoto(String me, String url);
    boolean setCoverPhoto(String me, String url);
    void updatePhotoVisibility(String me, String visibility);
}

@Repository
class MemberDaoImpl implements MemberDao {

    @Autowired
    private NamedParameterJdbcTemplate jdbcTemplate;

    @Autowired
    private Map<String, String> sqlMap;

    // PostgreSQL 的 TEXT[] 欄位 BeanPropertyRowMapper 無法轉成 List，所以自己對應
    static final RowMapper<Member> MEMBER_MAPPER = (rs, rowNum) -> {
        Member m = new Member();
        m.setId(rs.getString("id"));
        m.setRole(rs.getString("role"));
        m.setNickname(rs.getString("nickname"));
        m.setAge(rs.getInt("age"));
        m.setCity(rs.getString("city"));
        m.setJob(rs.getString("job"));
        m.setHeightCm(rs.getObject("height_cm", Integer.class));
        m.setEducation(rs.getString("education"));
        m.setBudget(rs.getString("budget"));
        m.setFrequency(rs.getString("frequency"));
        m.setRelationshipTypes(toList(rs.getArray("relationship_types")));
        m.setVerified(toList(rs.getArray("verified")));
        m.setPhotos(toList(rs.getArray("photos")));
        m.setTags(toList(rs.getArray("tags")));
        m.setIncomeLabel(rs.getString("income_label"));
        m.setExpectation(rs.getString("expectation"));
        m.setIntro(rs.getString("intro"));
        m.setDemo(rs.getBoolean("demo"));
        m.setOnline(rs.getBoolean("online"));
        m.setLastActiveAt(rs.getTimestamp("last_active_at").toInstant());
        m.setLiked(rs.getBoolean("liked"));
        m.setLikedMe(rs.getBoolean("liked_me"));
        m.setPhotoVisibility(rs.getString("photo_visibility"));
        m.setBanned(rs.getBoolean("banned"));
        return m;
    };

    private static List<String> toList(Array array) throws SQLException {
        return List.of((String[]) array.getArray());
    }

    @Override
    public List<Member> getMembers(MemberQuery q, String me, int limit) {
        List<String> types = q.getTypes();
        MapSqlParameterSource params = new MapSqlParameterSource()
            .addValue("me", me, Types.VARCHAR)
            .addValue("role", q.getRole(), Types.VARCHAR)
            .addValue("city", q.getCity(), Types.VARCHAR)
            .addValue("budget", q.getBudget(), Types.VARCHAR)
            .addValue("frequency", q.getFrequency(), Types.VARCHAR)
            .addValue("maxAge", q.getMaxAge(), Types.INTEGER)
            .addValue("types", types == null || types.isEmpty() ? null : String.join(",", types), Types.VARCHAR)
            .addValue("verifiedOnly", Boolean.TRUE.equals(q.getVerifiedOnly()))
            .addValue("onlineOnly", Boolean.TRUE.equals(q.getOnlineOnly()))
            .addValue("limit", limit);
        return jdbcTemplate.query(sqlMap.get("getMembers"), params, MEMBER_MAPPER);
    }

    @Override
    public Optional<Member> getMemberById(String id, String me) {
        MapSqlParameterSource params = new MapSqlParameterSource()
            .addValue("id", id)
            .addValue("me", me, Types.VARCHAR);
        try {
            return Optional.ofNullable(jdbcTemplate.queryForObject(sqlMap.get("getMemberById"), params, MEMBER_MAPPER));
        } catch (EmptyResultDataAccessException e) {
            return Optional.empty();
        }
    }

    @Override
    public void insertMember(String id, SignupRequest req) {
        MapSqlParameterSource params = new MapSqlParameterSource()
            .addValue("id", id)
            .addValue("role", req.getRole())
            .addValue("nickname", req.getNickname())
            .addValue("birthDate", req.getBirthDate())
            .addValue("city", req.getCity())
            .addValue("budget", req.getBudget())
            .addValue("frequency", req.getFrequency())
            .addValue("types", String.join(",", req.getRelationshipTypes()));
        jdbcTemplate.update(sqlMap.get("insertMember"), params);
    }

    @Override
    public void touchMember(String id) {
        jdbcTemplate.update(sqlMap.get("touchMember"), Map.of("id", id));
    }

    @Override
    public void updateProfile(String me, ProfileRequest req) {
        List<String> tags = req.getTags();
        MapSqlParameterSource params = new MapSqlParameterSource()
            .addValue("me", me)
            .addValue("nickname", req.getNickname())
            .addValue("city", req.getCity())
            .addValue("job", req.getJob(), Types.VARCHAR)
            .addValue("heightCm", req.getHeightCm(), Types.INTEGER)
            .addValue("education", req.getEducation(), Types.VARCHAR)
            .addValue("budget", req.getBudget())
            .addValue("frequency", req.getFrequency())
            .addValue("types", String.join(",", req.getRelationshipTypes()))
            .addValue("tags", tags == null || tags.isEmpty() ? null : String.join(",", tags), Types.VARCHAR)
            .addValue("intro", req.getIntro(), Types.VARCHAR)
            .addValue("expectation", req.getExpectation(), Types.VARCHAR);
        jdbcTemplate.update(sqlMap.get("updateProfile"), params);
    }

    @Override
    public boolean appendPhoto(String me, String url, int max) {
        return jdbcTemplate.update(sqlMap.get("appendPhoto"), Map.of("me", me, "url", url, "max", max)) > 0;
    }

    @Override
    public boolean removePhoto(String me, String url) {
        return jdbcTemplate.update(sqlMap.get("removePhoto"), Map.of("me", me, "url", url)) > 0;
    }

    @Override
    public boolean setCoverPhoto(String me, String url) {
        return jdbcTemplate.update(sqlMap.get("setCoverPhoto"), Map.of("me", me, "url", url)) > 0;
    }

    @Override
    public void updatePhotoVisibility(String me, String visibility) {
        jdbcTemplate.update(sqlMap.get("updatePhotoVisibility"), Map.of("me", me, "visibility", visibility));
    }
}
