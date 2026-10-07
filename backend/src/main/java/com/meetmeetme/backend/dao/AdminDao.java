package com.meetmeetme.backend.dao;

import com.meetmeetme.backend.model.AdminReport;
import com.meetmeetme.backend.model.Member;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Map;
import java.util.Optional;

// 檢舉處理與停權
public interface AdminDao {
    /** reporter、target 只有 id，完整資料由 service 補上 */
    List<AdminReport> getReportsByStatus(String status);
    Optional<AdminReport> getReportById(long id);
    boolean resolveReport(long id, String action, String admin);
    void resolveReportsForTarget(String target, String admin);
    void banMember(String target);
}

@Repository
class AdminDaoImpl implements AdminDao {

    @Autowired
    private NamedParameterJdbcTemplate jdbcTemplate;

    @Autowired
    private Map<String, String> sqlMap;

    private static final RowMapper<AdminReport> REPORT_MAPPER = (rs, rowNum) -> {
        Member reporter = new Member();
        reporter.setId(rs.getString("reporter_id"));
        Member target = new Member();
        target.setId(rs.getString("target_id"));
        AdminReport r = new AdminReport();
        r.setId(rs.getLong("id"));
        r.setReason(rs.getString("reason"));
        r.setDetail(rs.getString("detail"));
        r.setStatus(rs.getString("status"));
        r.setAction(rs.getString("action"));
        r.setCreatedAt(rs.getTimestamp("created_at").toInstant());
        r.setReporter(reporter);
        r.setTarget(target);
        return r;
    };

    @Override
    public List<AdminReport> getReportsByStatus(String status) {
        return jdbcTemplate.query(sqlMap.get("getReportsByStatus"), Map.of("status", status), REPORT_MAPPER);
    }

    @Override
    public Optional<AdminReport> getReportById(long id) {
        return jdbcTemplate.query(sqlMap.get("getReportById"), Map.of("id", id), REPORT_MAPPER).stream().findFirst();
    }

    @Override
    public boolean resolveReport(long id, String action, String admin) {
        return jdbcTemplate.update(sqlMap.get("resolveReport"), Map.of("id", id, "action", action, "admin", admin)) > 0;
    }

    @Override
    public void resolveReportsForTarget(String target, String admin) {
        jdbcTemplate.update(sqlMap.get("resolveReportsForTarget"), Map.of("target", target, "admin", admin));
    }

    @Override
    public void banMember(String target) {
        jdbcTemplate.update(sqlMap.get("banMember"), Map.of("target", target));
        jdbcTemplate.update(sqlMap.get("deleteSessionsForMember"), Map.of("target", target));
    }
}
