package com.meetmeetme.backend.controller;

import com.meetmeetme.backend.config.AuthInterceptor;
import com.meetmeetme.backend.model.AuthResponse;
import com.meetmeetme.backend.model.LoginRequest;
import com.meetmeetme.backend.model.Member;
import com.meetmeetme.backend.model.SignupRequest;
import com.meetmeetme.backend.service.AuthService;
import com.meetmeetme.backend.service.MemberService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
public class AuthController {

    @Autowired
    private AuthService authService;

    @Autowired
    private MemberService memberService;

    // 註冊，成功後直接登入
    @PostMapping("/auth/signup")
    public AuthResponse signup(@RequestBody SignupRequest req) {
        return authService.signup(req);
    }

    @PostMapping("/auth/login")
    public AuthResponse login(@RequestBody LoginRequest req) {
        return authService.login(req);
    }

    // 登出：讓這個 token 失效
    @PostMapping("/auth/logout")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void logout(@RequestHeader(name = HttpHeaders.AUTHORIZATION, required = false) String authorization) {
        if (authorization != null && authorization.startsWith("Bearer ")) {
            authService.logout(authorization.substring("Bearer ".length()));
        }
    }

    // 目前登入的會員
    @GetMapping("/me")
    public Member me(@RequestAttribute(name = AuthInterceptor.MEMBER_ID, required = false) String me) {
        return memberService.getMe(me);
    }
}
