package com.meetmeetme.backend.service;

import com.meetmeetme.backend.dao.MemberDao;
import com.meetmeetme.backend.dao.MembershipDao;
import com.meetmeetme.backend.dao.SocialDao;
import com.meetmeetme.backend.model.LikersResponse;
import com.meetmeetme.backend.model.Member;
import com.meetmeetme.backend.model.Membership;
import com.meetmeetme.backend.model.MemberQuery;
import com.meetmeetme.backend.model.ReportRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.Comparator;
import java.util.List;
import java.util.Locale;

public interface MemberService {
    List<Member> getMembers(MemberQuery query, String me);
    Member getMember(String id, String me);
    /** 目前登入的會員，含方案權益 */
    Member getMe(String me);
    void like(String id, String me);
    void unlike(String id, String me);
    void block(String id, String me);
    void report(String id, ReportRequest req, String me);
    LikersResponse getLikers(String me);
}

@Service
class MemberServiceImpl implements MemberService {

    private static final int DEFAULT_SIZE = 20;
    private static final int MAX_SIZE = 100;

    @Autowired
    private MemberDao memberDao;

    @Autowired
    private SocialDao socialDao;

    @Autowired
    private MembershipDao membershipDao;

    @Autowired
    private MembershipService membershipService;

    /** 瀏覽者；未登入為 null */
    private record Viewer(Member member, boolean premium, boolean admin) {
    }

    @Override
    public List<Member> getMembers(MemberQuery q, String me) {
        // member_view 的身分是小寫（baby / daddy），前端可能傳大寫
        if (q.getRole() != null) q.setRole(q.getRole().isBlank() ? null : q.getRole().toLowerCase(Locale.ROOT));
        if (q.getCity() != null && q.getCity().isBlank()) q.setCity(null);
        if (q.getBudget() != null && q.getBudget().isBlank()) q.setBudget(null);
        if (q.getFrequency() != null && q.getFrequency().isBlank()) q.setFrequency(null);
        int size = Math.max(1, Math.min(q.getSize() == null ? DEFAULT_SIZE : q.getSize(), MAX_SIZE));

        Viewer viewer = viewer(me);
        // 預算、頻率篩選是 Daddy 的付費功能
        if (viewer == null || ("daddy".equals(viewer.member().getRole()) && !viewer.premium())) {
            q.setBudget(null);
            q.setFrequency(null);
        }
        boolean byMatch = viewer != null && "match".equals(q.getSort());
        // 依契合度排序要先多抓一些，在 Java 算完分數再截斷
        List<Member> list = memberDao.getMembers(q, me, byMatch ? MAX_SIZE : size);
        list.forEach(m -> decorate(m, viewer));
        if (byMatch) {
            list.sort(Comparator.comparing(Member::getMatch).reversed());
        }
        return list.size() > size ? list.subList(0, size) : list;
    }

    @Override
    public Member getMember(String id, String me) {
        Viewer viewer = viewer(me);
        boolean self = me != null && me.equals(id);
        if (me != null && !self && socialDao.isBlockedBetween(me, id)) {
            throw Errors.notFound();
        }
        Member m = memberDao.getMemberById(id, me).orElseThrow(Errors::notFound);
        // 停權會員只有管理員看得到
        if (Boolean.TRUE.equals(m.getBanned()) && !self && (viewer == null || !viewer.admin())) {
            throw Errors.notFound();
        }
        decorate(m, viewer);
        return m;
    }

    @Override
    public Member getMe(String me) {
        Member m = memberDao.getMemberById(Errors.requireMe(me), null).orElseThrow(Errors::unauthorized);
        m.setMembership(membershipService.getMembership(m));
        return m;
    }

    @Override
    public void like(String id, String me) {
        Member target = getMember(id, Errors.requireMe(me));
        if (me.equals(target.getId()) || socialDao.isLiked(me, id)) return;
        Member viewer = memberDao.getMemberById(me, null).orElseThrow(Errors::unauthorized);
        Membership membership = membershipService.getMembership(viewer);
        if (membership.getLikeLimit() != null && membership.getLikesToday() >= membership.getLikeLimit()) {
            throw new ResponseStatusException(HttpStatus.TOO_MANY_REQUESTS,
                "今天的 " + membership.getLikeLimit() + " 次喜歡已經用完，" + upgradeHint(viewer) + "就沒有次數限制");
        }
        socialDao.like(me, id);
    }

    @Override
    public void unlike(String id, String me) {
        socialDao.unlike(Errors.requireMe(me), id);
    }

    @Override
    public void block(String id, String me) {
        getMember(id, Errors.requireMe(me));
        if (me.equals(id)) throw Errors.badRequest("不能封鎖自己");
        socialDao.block(me, id);
    }

    @Override
    public void report(String id, ReportRequest req, String me) {
        getMember(id, Errors.requireMe(me));
        if (req.getReason() == null || !Options.REPORT_REASONS.contains(req.getReason())) {
            throw Errors.badRequest("請選擇檢舉原因");
        }
        String detail = req.getDetail() == null || req.getDetail().isBlank() ? null : req.getDetail().trim();
        if (detail != null && detail.length() > 1000) throw Errors.badRequest("補充說明最多 1000 字");
        socialDao.report(me, id, req.getReason(), detail);
    }

    @Override
    public LikersResponse getLikers(String me) {
        Viewer viewer = viewer(Errors.requireMe(me));
        if (viewer == null) throw Errors.unauthorized();
        LikersResponse res = new LikersResponse();
        res.setCount(socialDao.countLikers(me));
        res.setLocked(!viewer.premium());
        if (viewer.premium()) {
            List<Member> list = socialDao.getLikers(me);
            list.forEach(m -> decorate(m, viewer));
            res.setItems(list);
        } else {
            res.setItems(List.of());
        }
        return res;
    }

    private Viewer viewer(String me) {
        if (me == null) return null;
        return memberDao.getMemberById(me, null)
            .map(m -> new Viewer(m, membershipService.isPremium(m), membershipDao.isAdmin(me)))
            .orElse(null);
    }

    // 補上契合度，並依權限決定能不能看照片
    private static void decorate(Member m, Viewer viewer) {
        boolean self = viewer != null && viewer.member().getId().equals(m.getId());
        m.setMatch(viewer == null || self ? null : MatchScore.of(viewer.member(), m));
        // 照片可見度是個人設定，只回傳給本人
        String visibility = m.getPhotoVisibility();
        if (!self) m.setPhotoVisibility(null);
        if (m.getPhotos().isEmpty()) return;

        String lock = null;
        if (self || Boolean.TRUE.equals(m.getDemo())) {
            // 自己的照片、示範帳號的照片都看得到（未登入時前端會模糊）
        } else if (viewer == null) {
            lock = "LOGIN";
        } else if (viewer.admin()) {
            // 管理員審核需要看照片
        } else if ("daddy".equals(viewer.member().getRole()) && !viewer.premium()) {
            lock = "UPGRADE";
        } else if ("LIKED".equals(visibility) && !Boolean.TRUE.equals(m.getLikedMe())) {
            lock = "PRIVATE";
        }
        if (lock != null) {
            m.setPhotoCount(m.getPhotos().size());
            m.setPhotos(List.of());
            m.setPhotoLock(lock);
        }
    }

    static String upgradeHint(Member member) {
        return "daddy".equals(member.getRole()) ? "升級尊榮會員" : "完成真人與身分認證";
    }
}
