package com.meetmeetme.backend.dao;

import com.meetmeetme.backend.model.Account;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.BeanPropertyRowMapper;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Map;
import java.util.Optional;

public interface AccountDao {
    void insertAccount(String memberId, String email, String passwordHash);
    boolean existsByEmail(String email);
    Optional<Account> getAccountByEmail(String email);
    void insertSession(String tokenHash, String memberId);
    Optional<String> getSessionMemberId(String tokenHash);
    void deleteSession(String tokenHash);
}

@Repository
class AccountDaoImpl implements AccountDao {

    @Autowired
    private NamedParameterJdbcTemplate jdbcTemplate;

    @Autowired
    private Map<String, String> sqlMap;

    @Override
    public void insertAccount(String memberId, String email, String passwordHash) {
        jdbcTemplate.update(sqlMap.get("insertAccount"),
            Map.of("memberId", memberId, "email", email, "passwordHash", passwordHash));
    }

    @Override
    public boolean existsByEmail(String email) {
        Integer count = jdbcTemplate.queryForObject(sqlMap.get("countAccountByEmail"), Map.of("email", email), Integer.class);
        return count != null && count > 0;
    }

    @Override
    public Optional<Account> getAccountByEmail(String email) {
        List<Account> list = jdbcTemplate.query(sqlMap.get("getAccountByEmail"), Map.of("email", email),
            new BeanPropertyRowMapper<>(Account.class));
        return list.stream().findFirst();
    }

    @Override
    public void insertSession(String tokenHash, String memberId) {
        jdbcTemplate.update(sqlMap.get("insertSession"), Map.of("tokenHash", tokenHash, "memberId", memberId));
    }

    @Override
    public Optional<String> getSessionMemberId(String tokenHash) {
        List<String> list = jdbcTemplate.queryForList(sqlMap.get("getSessionMemberId"), Map.of("tokenHash", tokenHash), String.class);
        return list.stream().findFirst();
    }

    @Override
    public void deleteSession(String tokenHash) {
        jdbcTemplate.update(sqlMap.get("deleteSession"), Map.of("tokenHash", tokenHash));
    }
}
