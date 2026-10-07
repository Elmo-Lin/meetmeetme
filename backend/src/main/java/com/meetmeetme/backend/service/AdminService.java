package com.meetmeetme.backend.service;

import com.meetmeetme.backend.dao.AdminDao;
import com.meetmeetme.backend.dao.MembershipDao;
import com.meetmeetme.backend.dao.VerificationDao;
import com.meetmeetme.backend.model.AdminReport;
import com.meetmeetme.backend.model.ReviewRequest;
import com.meetmeetme.backend.model.Verification;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Set;

// 管理後台：審核認證、處理檢舉
public interface AdminService {
    List<Verification> getVerifications(String status, String me);
    void approveVerification(long id, ReviewRequest req, String me);
    void rejectVerification(long id, ReviewRequest req, String me);
    List<AdminReport> getReports(String status, String me);
    void resolveReport(long id, String action, String me);
    byte[] loadFile(String key, String me);
    String fileContentType(String key);
    List<String> incomeLabels();
}

@Service
class AdminServiceImpl implements AdminService {

    static final String FILE_URL_PREFIX = "/api/admin/files/";

    @Autowired
    private MembershipDao membershipDao;

    @Autowired
    private VerificationDao verificationDao;

    @Autowired
    private AdminDao adminDao;

    @Autowired
    private MemberService memberService;

    @Autowired
    private DocumentStorage documentStorage;

    @Override
    public List<Verification> getVerifications(String status, String me) {
        requireAdmin(me);
        if (!Set.of("PENDING", "APPROVED", "REJECTED").contains(status)) throw Errors.badRequest("狀態不正確");
        List<Verification> list = verificationDao.getVerificationsByStatus(status);
        for (Verification v : list) {
            v.setMember(memberService.getMember(v.getMember().getId(), me));
            v.setFiles(v.getFiles().stream().map(k -> FILE_URL_PREFIX + k).toList());
        }
        return list;
    }

    @Override
    @Transactional
    public void approveVerification(long id, ReviewRequest req, String me) {
        requireAdmin(me);
        Verification v = verificationDao.getVerificationById(id).orElseThrow(Errors::notFound);
        String incomeLabel = req == null ? null : req.getIncomeLabel();
        // List.of 的 contains(null) 會丟例外，要先檢查
        if ("income".equals(v.getType()) && (incomeLabel == null || !Options.INCOME_LABELS.contains(incomeLabel))) {
            throw Errors.badRequest("請選擇財力等級");
        }
        if (!verificationDao.review(id, "APPROVED", null, me)) throw alreadyReviewed();
        String memberId = v.getMember().getId();
        verificationDao.addVerifiedBadge(memberId, v.getType());
        if ("income".equals(v.getType())) verificationDao.setIncomeLabel(memberId, incomeLabel);
    }

    @Override
    public void rejectVerification(long id, ReviewRequest req, String me) {
        requireAdmin(me);
        String reason = req == null || req.getReason() == null ? "" : req.getReason().trim();
        if (reason.isEmpty()) throw Errors.badRequest("請填寫退件原因，會員會看到");
        if (reason.length() > 200) throw Errors.badRequest("退件原因最多 200 字");
        verificationDao.getVerificationById(id).orElseThrow(Errors::notFound);
        if (!verificationDao.review(id, "REJECTED", reason, me)) throw alreadyReviewed();
    }

    @Override
    public List<AdminReport> getReports(String status, String me) {
        requireAdmin(me);
        if (!Set.of("OPEN", "RESOLVED").contains(status)) throw Errors.badRequest("狀態不正確");
        List<AdminReport> list = adminDao.getReportsByStatus(status);
        for (AdminReport r : list) {
            r.setReporter(memberService.getMember(r.getReporter().getId(), me));
            r.setTarget(memberService.getMember(r.getTarget().getId(), me));
        }
        return list;
    }

    @Override
    @Transactional
    public void resolveReport(long id, String action, String me) {
        requireAdmin(me);
        AdminReport r = adminDao.getReportById(id).orElseThrow(Errors::notFound);
        if ("DISMISS".equals(action)) {
            if (!adminDao.resolveReport(id, "DISMISS", me)) throw alreadyReviewed();
        } else if ("BAN".equals(action)) {
            String target = r.getTarget().getId();
            if (target.equals(me)) throw Errors.badRequest("不能停權自己");
            if (!adminDao.resolveReport(id, "BAN", me)) throw alreadyReviewed();
            adminDao.banMember(target);
            adminDao.resolveReportsForTarget(target, me);
        } else {
            throw Errors.badRequest("請選擇處理方式");
        }
    }

    @Override
    public byte[] loadFile(String key, String me) {
        requireAdmin(me);
        return documentStorage.load(key).orElseThrow(Errors::notFound);
    }

    @Override
    public String fileContentType(String key) {
        return documentStorage.contentType(key);
    }

    @Override
    public List<String> incomeLabels() {
        return Options.INCOME_LABELS;
    }

    private void requireAdmin(String me) {
        if (!membershipDao.isAdmin(Errors.requireMe(me))) throw Errors.forbidden("需要管理員權限");
    }

    private static ResponseStatusException alreadyReviewed() {
        return new ResponseStatusException(HttpStatus.CONFLICT, "這筆已經處理過了，請重新整理");
    }
}
