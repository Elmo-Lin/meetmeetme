package com.meetmeetme.backend.controller;

import com.meetmeetme.backend.config.AuthInterceptor;
import com.meetmeetme.backend.model.AdminReport;
import com.meetmeetme.backend.model.ResolveRequest;
import com.meetmeetme.backend.model.ReviewRequest;
import com.meetmeetme.backend.model.Verification;
import com.meetmeetme.backend.service.AdminService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

// 管理後台；每個方法都會檢查管理員權限
@RestController
@RequestMapping("/api/admin")
public class AdminController {

    @Autowired
    private AdminService adminService;

    @GetMapping("/verifications")
    public List<Verification> getVerifications(@RequestParam(defaultValue = "PENDING") String status,
                                               @RequestAttribute(name = AuthInterceptor.MEMBER_ID, required = false) String me) {
        return adminService.getVerifications(status, me);
    }

    @PostMapping("/verifications/{id}/approve")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void approve(@PathVariable long id, @RequestBody(required = false) ReviewRequest req,
                        @RequestAttribute(name = AuthInterceptor.MEMBER_ID, required = false) String me) {
        adminService.approveVerification(id, req, me);
    }

    @PostMapping("/verifications/{id}/reject")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void reject(@PathVariable long id, @RequestBody ReviewRequest req,
                       @RequestAttribute(name = AuthInterceptor.MEMBER_ID, required = false) String me) {
        adminService.rejectVerification(id, req, me);
    }

    @GetMapping("/income-labels")
    public List<String> incomeLabels() {
        return adminService.incomeLabels();
    }

    @GetMapping("/reports")
    public List<AdminReport> getReports(@RequestParam(defaultValue = "OPEN") String status,
                                        @RequestAttribute(name = AuthInterceptor.MEMBER_ID, required = false) String me) {
        return adminService.getReports(status, me);
    }

    @PostMapping("/reports/{id}/resolve")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void resolve(@PathVariable long id, @RequestBody ResolveRequest req,
                        @RequestAttribute(name = AuthInterceptor.MEMBER_ID, required = false) String me) {
        adminService.resolveReport(id, req.getAction(), me);
    }

    // 認證文件；只有管理員能讀，前端用 fetch 帶 token 取回再顯示
    @GetMapping("/files/{key}")
    public ResponseEntity<byte[]> file(@PathVariable String key,
                                       @RequestAttribute(name = AuthInterceptor.MEMBER_ID, required = false) String me) {
        byte[] content = adminService.loadFile(key, me);
        return ResponseEntity.ok()
            .contentType(MediaType.parseMediaType(adminService.fileContentType(key)))
            .header("Cache-Control", "private, no-store")
            .body(content);
    }
}
