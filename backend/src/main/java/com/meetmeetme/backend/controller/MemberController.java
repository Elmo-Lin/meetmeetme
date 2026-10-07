package com.meetmeetme.backend.controller;

import com.meetmeetme.backend.config.AuthInterceptor;
import com.meetmeetme.backend.model.Member;
import com.meetmeetme.backend.model.MemberPage;
import com.meetmeetme.backend.model.MemberQuery;
import com.meetmeetme.backend.model.ReportRequest;
import com.meetmeetme.backend.service.MemberService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/members")
public class MemberController {

    @Autowired
    private MemberService memberService;

    // 取得會員列表，可依身分、地區、預算等篩選；登入後可依契合度排序
    @GetMapping
    public MemberPage getMembers(@ModelAttribute MemberQuery query,
                                 @RequestAttribute(name = AuthInterceptor.MEMBER_ID, required = false) String me) {
        return new MemberPage(memberService.getMembers(query, me));
    }

    @GetMapping("/{id}")
    public Member getMember(@PathVariable String id,
                            @RequestAttribute(name = AuthInterceptor.MEMBER_ID, required = false) String me) {
        return memberService.getMember(id, me);
    }

    @PutMapping("/{id}/like")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void like(@PathVariable String id,
                     @RequestAttribute(name = AuthInterceptor.MEMBER_ID, required = false) String me) {
        memberService.like(id, me);
    }

    @DeleteMapping("/{id}/like")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void unlike(@PathVariable String id,
                       @RequestAttribute(name = AuthInterceptor.MEMBER_ID, required = false) String me) {
        memberService.unlike(id, me);
    }

    @PutMapping("/{id}/block")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void block(@PathVariable String id,
                      @RequestAttribute(name = AuthInterceptor.MEMBER_ID, required = false) String me) {
        memberService.block(id, me);
    }

    @PostMapping("/{id}/report")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void report(@PathVariable String id, @RequestBody ReportRequest req,
                       @RequestAttribute(name = AuthInterceptor.MEMBER_ID, required = false) String me) {
        memberService.report(id, req, me);
    }
}
