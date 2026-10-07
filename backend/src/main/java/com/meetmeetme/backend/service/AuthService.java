package com.meetmeetme.backend.service;

import com.meetmeetme.backend.dao.AccountDao;
import com.meetmeetme.backend.dao.MemberDao;
import com.meetmeetme.backend.model.Account;
import com.meetmeetme.backend.model.AuthResponse;
import com.meetmeetme.backend.model.LoginRequest;
import com.meetmeetme.backend.model.SignupRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.security.SecureRandom;
import java.time.LocalDate;
import java.time.Period;
import java.util.Base64;
import java.util.Locale;
import java.util.Optional;
import java.util.UUID;
import java.util.regex.Pattern;

public interface AuthService {
    AuthResponse signup(SignupRequest req);
    AuthResponse login(LoginRequest req);
    /** token 有效時回傳會員 id */
    Optional<String> resolveMemberId(String token);
    void logout(String token);
}

@Service
class AuthServiceImpl implements AuthService {

    private static final Pattern EMAIL = Pattern.compile("^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$");
    private static final SecureRandom RANDOM = new SecureRandom();
    private static final BCryptPasswordEncoder ENCODER = new BCryptPasswordEncoder();

    @Autowired
    private AccountDao accountDao;

    @Autowired
    private MemberDao memberDao;

    @Autowired
    private MemberService memberService;

    @Override
    @Transactional
    public AuthResponse signup(SignupRequest req) {
        String email = normalizeEmail(req.getEmail());
        validate(req, email);
        if (accountDao.existsByEmail(email)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "這個 Email 已經註冊過了");
        }
        String id = UUID.randomUUID().toString();
        req.setRole(req.getRole().toUpperCase(Locale.ROOT));
        req.setNickname(req.getNickname().trim());
        memberDao.insertMember(id, req);
        accountDao.insertAccount(id, email, ENCODER.encode(req.getPassword()));
        return issue(id);
    }

    @Override
    public AuthResponse login(LoginRequest req) {
        String email = normalizeEmail(req.getEmail());
        Optional<Account> account = accountDao.getAccountByEmail(email);
        if (account.isEmpty() || req.getPassword() == null
                || !ENCODER.matches(req.getPassword(), account.get().getPasswordHash())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Email 或密碼錯誤");
        }
        if (Boolean.TRUE.equals(account.get().getBanned())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "此帳號已被停權，如有疑問請聯絡客服");
        }
        return issue(account.get().getMemberId());
    }

    @Override
    public Optional<String> resolveMemberId(String token) {
        return accountDao.getSessionMemberId(Hashing.sha256(token));
    }

    @Override
    public void logout(String token) {
        accountDao.deleteSession(Hashing.sha256(token));
    }

    private AuthResponse issue(String memberId) {
        byte[] bytes = new byte[32];
        RANDOM.nextBytes(bytes);
        String token = Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
        accountDao.insertSession(Hashing.sha256(token), memberId);
        AuthResponse res = new AuthResponse();
        res.setToken(token);
        // 和 /api/me 一樣帶上方案權益，前端登入後馬上就能用
        res.setMember(memberService.getMe(memberId));
        return res;
    }

    private static void validate(SignupRequest req, String email) {
        if (!EMAIL.matcher(email).matches()) throw Errors.badRequest("Email 格式不正確");
        if (req.getPassword() == null || req.getPassword().length() < 8) throw Errors.badRequest("密碼至少要 8 碼");
        if (req.getRole() == null || !Options.ROLES.contains(req.getRole().toUpperCase(Locale.ROOT))) throw Errors.badRequest("請選擇身分");
        if (req.getNickname() == null || req.getNickname().isBlank() || req.getNickname().length() > 20) throw Errors.badRequest("暱稱需為 1–20 字");
        if (req.getBirthDate() == null || Period.between(req.getBirthDate(), LocalDate.now()).getYears() < 18) throw Errors.badRequest("未滿 18 歲無法註冊");
        if (!Options.CITIES.contains(req.getCity())) throw Errors.badRequest("請選擇所在地區");
        if (!Options.BUDGETS.contains(req.getBudget())) throw Errors.badRequest("請選擇預算區間");
        if (!Options.FREQUENCIES.contains(req.getFrequency())) throw Errors.badRequest("請選擇見面頻率");
        if (req.getRelationshipTypes() == null || req.getRelationshipTypes().isEmpty()
                || !Options.RELATIONSHIP_TYPES.containsAll(req.getRelationshipTypes())) throw Errors.badRequest("請選擇關係類型");
        if (!Boolean.TRUE.equals(req.getAcceptTerms())) throw Errors.badRequest("請先同意服務條款");
    }

    private static String normalizeEmail(String email) {
        return email == null ? "" : email.trim().toLowerCase(Locale.ROOT);
    }
}
