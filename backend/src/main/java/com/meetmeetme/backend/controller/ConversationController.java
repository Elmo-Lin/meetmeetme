package com.meetmeetme.backend.controller;

import com.meetmeetme.backend.config.AuthInterceptor;
import com.meetmeetme.backend.model.Conversation;
import com.meetmeetme.backend.model.ConversationRequest;
import com.meetmeetme.backend.model.IdResponse;
import com.meetmeetme.backend.model.Message;
import com.meetmeetme.backend.model.MessageRequest;
import com.meetmeetme.backend.service.ConversationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/conversations")
public class ConversationController {

    @Autowired
    private ConversationService conversationService;

    // 我的對話列表，最新的在前
    @GetMapping
    public List<Conversation> getConversations(@RequestAttribute(name = AuthInterceptor.MEMBER_ID, required = false) String me) {
        return conversationService.getConversations(me);
    }

    // 和某位會員開啟對話；已存在就回傳原本的
    @PostMapping
    public IdResponse openConversation(@RequestBody ConversationRequest req,
                                       @RequestAttribute(name = AuthInterceptor.MEMBER_ID, required = false) String me) {
        IdResponse res = new IdResponse();
        res.setId(conversationService.openConversation(req.getMemberId(), me));
        return res;
    }

    // 取得 id 大於 after 的訊息（前端輪詢用）
    @GetMapping("/{id}/messages")
    public List<Message> getMessages(@PathVariable String id, @RequestParam(defaultValue = "0") long after,
                                     @RequestAttribute(name = AuthInterceptor.MEMBER_ID, required = false) String me) {
        return conversationService.getMessages(id, after, me);
    }

    @PostMapping("/{id}/messages")
    public Message sendMessage(@PathVariable String id, @RequestBody MessageRequest req,
                               @RequestAttribute(name = AuthInterceptor.MEMBER_ID, required = false) String me) {
        return conversationService.sendMessage(id, req.getBody(), me);
    }
}
