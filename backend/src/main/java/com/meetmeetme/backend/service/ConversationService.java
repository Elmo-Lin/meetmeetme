package com.meetmeetme.backend.service;

import com.meetmeetme.backend.dao.ConversationDao;
import com.meetmeetme.backend.dao.MemberDao;
import com.meetmeetme.backend.dao.SocialDao;
import com.meetmeetme.backend.model.Conversation;
import com.meetmeetme.backend.model.Member;
import com.meetmeetme.backend.model.Message;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Locale;

public interface ConversationService {
    List<Conversation> getConversations(String me);
    String openConversation(String memberId, String me);
    List<Message> getMessages(String conversationId, long after, String me);
    Message sendMessage(String conversationId, String body, String me);
}

@Service
class ConversationServiceImpl implements ConversationService {

    private static final int MAX_LENGTH = 2000;

    @Autowired
    private ConversationDao conversationDao;

    @Autowired
    private MemberDao memberDao;

    @Autowired
    private SocialDao socialDao;

    @Autowired
    private MemberService memberService;

    @Autowired
    private MembershipService membershipService;

    @Override
    public List<Conversation> getConversations(String me) {
        Member viewer = memberService.getMe(me);
        // 已讀回條是付費功能
        boolean premium = viewer.getMembership().getPremium();
        List<Conversation> list = conversationDao.getConversations(me);
        // 對話數量不多，逐筆補上對方的完整資料
        for (Conversation c : list) {
            c.setMember(memberService.getMember(c.getMember().getId(), me));
            if (!premium) c.setOtherReadUpTo(null);
        }
        return list;
    }

    @Override
    @Transactional
    public String openConversation(String memberId, String me) {
        Member viewer = memberService.getMe(me);
        Member other = memberService.getMember(memberId, me);
        if (viewer.getId().equals(other.getId())) throw Errors.badRequest("不能和自己聊天");
        if (other.getDemo() && !viewer.getDemo()) throw Errors.forbidden("示範帳號無法傳訊");
        if (other.getRole().equals(viewer.getRole())) throw Errors.forbidden("只能與不同身分的會員聊天");

        // 固定讓 id 小的放前面，A 找 B 與 B 找 A 會是同一個對話
        String low = me.compareTo(memberId) < 0 ? me : memberId;
        String high = low.equals(me) ? memberId : me;
        long id = conversationDao.createConversation(low, high);
        conversationDao.addParticipant(id, me);
        conversationDao.addParticipant(id, memberId);
        return String.valueOf(id);
    }

    @Override
    @Transactional
    public List<Message> getMessages(String conversationId, long after, String me) {
        long id = requireParticipant(conversationId, Errors.requireMe(me));
        List<Message> list = conversationDao.getMessagesAfter(id, me, after);
        conversationDao.markRead(id, me);
        return list;
    }

    @Override
    @Transactional
    public Message sendMessage(String conversationId, String body, String me) {
        long id = requireParticipant(conversationId, Errors.requireMe(me));
        String other = conversationDao.getOtherMemberId(id, me).orElseThrow(Errors::notFound);
        if (socialDao.isBlockedBetween(me, other)) throw Errors.notFound();

        // 免費會員只能回覆：對方要先傳過訊息
        Member viewer = memberService.getMe(me);
        if (!viewer.getMembership().getPremium() && !conversationDao.hasMessageFromOther(id, me)) {
            throw Errors.forbidden("免費會員只能回覆對方的訊息，" + MemberServiceImpl.upgradeHint(viewer) + "後就能主動傳訊");
        }

        String text = body == null ? "" : body.trim();
        if (text.isEmpty()) throw Errors.badRequest("訊息不能是空白");
        if (text.length() > MAX_LENGTH) throw Errors.badRequest("訊息最多 2000 字");
        String lower = text.toLowerCase(Locale.ROOT);
        boolean risky = Options.RISK_WORDS.stream().anyMatch(lower::contains);

        Message msg = conversationDao.insertMessage(id, me, text, risky);
        conversationDao.updateLastMessage(id, msg.getId(), msg.getCreatedAt());
        conversationDao.markRead(id, me);
        return msg;
    }

    private long requireParticipant(String conversationId, String me) {
        long id;
        try {
            id = Long.parseLong(conversationId);
        } catch (NumberFormatException e) {
            throw Errors.notFound();
        }
        conversationDao.getOtherMemberId(id, me).orElseThrow(Errors::notFound);
        return id;
    }
}
