package com.meetmeetme.backend.service;

import com.meetmeetme.backend.dao.MemberDao;
import com.meetmeetme.backend.dao.MembershipDao;
import com.meetmeetme.backend.dao.SocialDao;
import com.meetmeetme.backend.model.Member;
import com.meetmeetme.backend.model.Membership;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.Instant;
import java.util.Map;
import java.util.Optional;

/**
 * 方案權益（與前端方案頁一致）：
 * Daddy 付費訂閱、Baby 完成真人 + 身分認證即為 premium；
 * 免費會員每日喜歡次數有限、只能回覆訊息，免費 Daddy 看不到照片與進階篩選。
 */
public interface MembershipService {
    Membership getMembership(Member member);
    boolean isPremium(Member member);
    Membership checkout(String plan, String me);
}

@Service
class MembershipServiceImpl implements MembershipService {

    private static final int FREE_DADDY_LIKES = 3;
    private static final int FREE_BABY_LIKES = 10;

    private record Plan(int amount, Duration duration) {
    }

    private static final Map<String, Plan> PLANS = Map.of(
        "TRIAL", new Plan(0, Duration.ofDays(7)),
        "MONTHLY", new Plan(1680, Duration.ofDays(30)),
        "QUARTERLY", new Plan(4380, Duration.ofDays(90)));

    @Autowired
    private MembershipDao membershipDao;

    @Autowired
    private MemberDao memberDao;

    @Autowired
    private SocialDao socialDao;

    @Autowired
    private PaymentGateway paymentGateway;

    @Override
    public Membership getMembership(Member member) {
        Membership m = new Membership();
        Optional<Membership> sub = "daddy".equals(member.getRole())
            ? membershipDao.getActiveSubscription(member.getId()) : Optional.empty();
        sub.ifPresent(s -> {
            m.setPlan(s.getPlan());
            m.setEndsAt(s.getEndsAt());
        });
        boolean verified = isVerifiedBaby(member);
        m.setPremium(sub.isPresent() || verified);
        m.setPremiumReason(sub.isPresent() ? "SUBSCRIPTION" : verified ? "VERIFIED" : null);
        m.setTrialUsed("daddy".equals(member.getRole()) && membershipDao.hasUsedTrial(member.getId()));
        m.setLikeLimit(m.getPremium() ? null : "daddy".equals(member.getRole()) ? FREE_DADDY_LIKES : FREE_BABY_LIKES);
        m.setLikesToday(socialDao.countLikesToday(member.getId()));
        m.setAdmin(membershipDao.isAdmin(member.getId()));
        return m;
    }

    @Override
    public boolean isPremium(Member member) {
        if (isVerifiedBaby(member)) return true;
        return "daddy".equals(member.getRole()) && membershipDao.getActiveSubscription(member.getId()).isPresent();
    }

    @Override
    @Transactional
    public Membership checkout(String planName, String me) {
        Member member = memberDao.getMemberById(Errors.requireMe(me), null).orElseThrow(Errors::unauthorized);
        if (!"daddy".equals(member.getRole())) {
            throw Errors.badRequest("甜心會員完成真人與身分認證即可免費使用完整功能，不需要付費");
        }
        Plan plan = planName == null ? null : PLANS.get(planName);
        if (plan == null) throw Errors.badRequest("請選擇方案");
        if ("TRIAL".equals(planName) && membershipDao.hasUsedTrial(me)) throw Errors.badRequest("你已經使用過 7 天試用");

        if (plan.amount() > 0) {
            long paymentId = membershipDao.insertPayment(me, planName, plan.amount(), paymentGateway.name());
            String ref = paymentGateway.charge(paymentId, me, plan.amount());
            membershipDao.markPaymentPaid(paymentId, ref);
        }
        // 已有訂閱就接在到期日後面
        Instant start = membershipDao.getActiveSubscription(me).map(Membership::getEndsAt).orElse(Instant.now());
        membershipDao.insertSubscription(me, planName, start, start.plus(plan.duration()));
        return getMembership(member);
    }

    private static boolean isVerifiedBaby(Member member) {
        return "baby".equals(member.getRole())
            && member.getVerified().contains("photo") && member.getVerified().contains("id");
    }
}
