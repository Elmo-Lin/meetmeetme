package com.meetmeetme.backend.config;

import com.meetmeetme.backend.dao.MemberDao;
import com.meetmeetme.backend.service.AuthService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.servlet.HandlerInterceptor;

/**
 * 讀取 Authorization: Bearer token，放進 request attribute "memberId"。
 * 沒帶 token 的請求照常放行（公開 API）；帶了無效 token 回 401，前端會清掉並登出。
 */
@Component
public class AuthInterceptor implements HandlerInterceptor {

    public static final String MEMBER_ID = "memberId";

    @Autowired
    private AuthService authService;

    @Autowired
    private MemberDao memberDao;

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) {
        String header = request.getHeader(HttpHeaders.AUTHORIZATION);
        if (header == null || !header.startsWith("Bearer ")) {
            return true;
        }
        String memberId = authService.resolveMemberId(header.substring("Bearer ".length()))
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "登入已過期，請重新登入"));
        request.setAttribute(MEMBER_ID, memberId);
        // 有動作就更新最後上線時間
        memberDao.touchMember(memberId);
        return true;
    }
}
