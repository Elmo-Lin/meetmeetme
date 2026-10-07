package com.meetmeetme.backend.service;

import com.meetmeetme.backend.dao.VerificationDao;
import com.meetmeetme.backend.model.Member;
import com.meetmeetme.backend.model.PhoneSendResponse;
import com.meetmeetme.backend.model.Verification;
import com.meetmeetme.backend.model.VerificationStatus;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.io.UncheckedIOException;
import java.security.SecureRandom;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Set;

// 會員自己的認證：手機簡訊驗證碼，以及真人 / 身分 / 財力的上傳申請
public interface VerificationService {
    VerificationStatus getStatus(String me);
    PhoneSendResponse sendPhoneCode(String phone, String me);
    Member verifyPhone(String code, String me);
    VerificationStatus submit(String type, List<MultipartFile> files, String me);
}

@Service
class VerificationServiceImpl implements VerificationService {

    private static final SecureRandom RANDOM = new SecureRandom();
    private static final int CODE_TTL_SECONDS = 600;
    private static final int MAX_ATTEMPTS = 5;
    private static final Set<String> TYPES = Set.of("photo", "id", "income");
    // 各種認證的檔案數量上限
    private static final Map<String, Integer> MAX_FILES = Map.of("photo", 1, "id", 2, "income", 3);

    @Autowired
    private VerificationDao verificationDao;

    @Autowired
    private MemberService memberService;

    @Autowired
    private SmsSender smsSender;

    @Autowired
    private DocumentStorage documentStorage;

    // 模擬簡訊時把驗證碼一起回傳，方便開發；接上真的簡訊商後要關掉
    @Value("${app.sms.expose-code}")
    private boolean exposeCode;

    @Override
    public VerificationStatus getStatus(String me) {
        Member member = memberService.getMe(me);
        VerificationStatus status = new VerificationStatus();
        status.setPhoneVerified(member.getVerified().contains("phone"));
        status.setPhone(verificationDao.getPhone(me).map(VerificationServiceImpl::maskPhone).orElse(null));
        List<Verification> list = verificationDao.getMyVerifications(me);
        // 會員自己看不到檔案路徑
        list.forEach(v -> {
            v.setMember(null);
            v.setFiles(null);
        });
        status.setRequests(list);
        return status;
    }

    @Override
    public PhoneSendResponse sendPhoneCode(String rawPhone, String me) {
        Member member = memberService.getMe(me);
        String phone = normalizePhone(rawPhone);
        if (phone == null) throw Errors.badRequest("請輸入正確的台灣手機號碼，例如 0912345678");
        if (member.getVerified().contains("phone") && verificationDao.getPhone(me).map(phone::equals).orElse(false)) {
            throw Errors.badRequest("這個號碼已經完成認證");
        }
        if (verificationDao.isPhoneUsedByOther(phone, me)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "這個手機號碼已被其他帳號使用");
        }
        if (verificationDao.hasRecentPhoneCode(me)) {
            throw new ResponseStatusException(HttpStatus.TOO_MANY_REQUESTS, "驗證碼已寄出，請稍候 60 秒再重新發送");
        }
        String code = String.format("%06d", RANDOM.nextInt(1_000_000));
        verificationDao.savePhoneCode(me, phone, Hashing.sha256(me + ":" + code));
        smsSender.send(phone, "【MeetMeetMe】你的驗證碼是 " + code + "，10 分鐘內有效。請勿將驗證碼提供給任何人。");

        PhoneSendResponse res = new PhoneSendResponse();
        res.setExpiresInSeconds(CODE_TTL_SECONDS);
        if (exposeCode) res.setDevCode(code);
        return res;
    }

    @Override
    @Transactional
    public Member verifyPhone(String code, String me) {
        Errors.requireMe(me);
        Map<String, Object> row = verificationDao.getPhoneCode(me)
            .orElseThrow(() -> Errors.badRequest("請先發送驗證碼"));
        if (!Boolean.TRUE.equals(row.get("valid"))) throw Errors.badRequest("驗證碼已過期，請重新發送");
        if (((Number) row.get("attempts")).intValue() >= MAX_ATTEMPTS) throw Errors.badRequest("錯誤次數過多，請重新發送驗證碼");
        String input = code == null ? "" : code.trim();
        if (!Hashing.sha256(me + ":" + input).equals(row.get("code_hash"))) {
            verificationDao.incrementPhoneAttempts(me);
            throw Errors.badRequest("驗證碼錯誤");
        }
        String phone = (String) row.get("phone");
        try {
            verificationDao.setPhone(me, phone);
        } catch (DuplicateKeyException e) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "這個手機號碼已被其他帳號使用");
        }
        verificationDao.addVerifiedBadge(me, "phone");
        verificationDao.deletePhoneCode(me);
        return memberService.getMe(me);
    }

    @Override
    @Transactional
    public VerificationStatus submit(String type, List<MultipartFile> files, String me) {
        Member member = memberService.getMe(me);
        if (!TYPES.contains(type)) throw Errors.notFound();
        if ("income".equals(type) && !"daddy".equals(member.getRole())) throw Errors.badRequest("財力認證僅開放 Daddy 申請");
        if (member.getVerified().contains(type)) throw Errors.badRequest("你已經完成這項認證");
        if (verificationDao.hasPending(me, type)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "已有一筆審核中的申請，請耐心等候");
        }
        List<MultipartFile> nonEmpty = files == null ? List.of() : files.stream().filter(f -> !f.isEmpty()).toList();
        if (nonEmpty.isEmpty()) throw Errors.badRequest("請上傳檔案");
        if (nonEmpty.size() > MAX_FILES.get(type)) throw Errors.badRequest("最多上傳 " + MAX_FILES.get(type) + " 個檔案");

        // 先全部檢查完再存檔，避免存了一半
        List<byte[]> contents = new ArrayList<>();
        List<String> extensions = new ArrayList<>();
        for (MultipartFile f : nonEmpty) {
            byte[] bytes;
            try {
                bytes = f.getBytes();
            } catch (IOException e) {
                throw new UncheckedIOException(e);
            }
            String ext = ImageTypes.detect(bytes, "income".equals(type));
            if (ext == null) {
                throw Errors.badRequest("income".equals(type) ? "只支援 JPG、PNG、WebP 或 PDF 檔案" : "只支援 JPG、PNG、WebP 格式的照片");
            }
            contents.add(bytes);
            extensions.add(ext);
        }
        List<String> keys = new ArrayList<>();
        for (int i = 0; i < contents.size(); i++) {
            keys.add(documentStorage.save(contents.get(i), extensions.get(i)));
        }
        verificationDao.insertVerification(me, type, keys);
        return getStatus(me);
    }

    // 接受 0912345678、0912-345-678、+886912345678
    private static String normalizePhone(String raw) {
        if (raw == null) return null;
        String digits = raw.replaceAll("[\\s-]", "");
        if (digits.startsWith("+886")) digits = "0" + digits.substring(4);
        return digits.matches("^09\\d{8}$") ? digits : null;
    }

    private static String maskPhone(String phone) {
        return phone.substring(0, 4) + "***" + phone.substring(7);
    }
}
