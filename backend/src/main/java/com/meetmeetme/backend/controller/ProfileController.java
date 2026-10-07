package com.meetmeetme.backend.controller;

import com.meetmeetme.backend.config.AuthInterceptor;
import com.meetmeetme.backend.model.LikersResponse;
import com.meetmeetme.backend.model.Member;
import com.meetmeetme.backend.model.PhoneSendRequest;
import com.meetmeetme.backend.model.PhoneSendResponse;
import com.meetmeetme.backend.model.PhoneVerifyRequest;
import com.meetmeetme.backend.model.PhotoVisibilityRequest;
import com.meetmeetme.backend.model.ProfileRequest;
import com.meetmeetme.backend.model.VerificationStatus;
import com.meetmeetme.backend.service.MemberService;
import com.meetmeetme.backend.service.ProfileService;
import com.meetmeetme.backend.service.VerificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/me")
public class ProfileController {

    @Autowired
    private ProfileService profileService;

    @Autowired
    private MemberService memberService;

    @Autowired
    private VerificationService verificationService;

    // 更新自己的個人資料
    @PutMapping
    public Member updateProfile(@RequestBody ProfileRequest req,
                                @RequestAttribute(name = AuthInterceptor.MEMBER_ID, required = false) String me) {
        return profileService.updateProfile(req, me);
    }

    // 上傳一張照片（multipart，欄位名稱 file）
    @PostMapping("/photos")
    public Member addPhoto(@RequestParam("file") MultipartFile file,
                           @RequestAttribute(name = AuthInterceptor.MEMBER_ID, required = false) String me) {
        return profileService.addPhoto(file, me);
    }

    @DeleteMapping("/photos")
    public Member removePhoto(@RequestParam String url,
                              @RequestAttribute(name = AuthInterceptor.MEMBER_ID, required = false) String me) {
        return profileService.removePhoto(url, me);
    }

    // 設為大頭照（移到第一張）
    @PutMapping("/photos/cover")
    public Member setCoverPhoto(@RequestParam String url,
                                @RequestAttribute(name = AuthInterceptor.MEMBER_ID, required = false) String me) {
        return profileService.setCoverPhoto(url, me);
    }

    // MEMBERS：所有會員可看；LIKED：只有我按過喜歡的人可看
    @PutMapping("/photo-visibility")
    public Member setPhotoVisibility(@RequestBody PhotoVisibilityRequest req,
                                     @RequestAttribute(name = AuthInterceptor.MEMBER_ID, required = false) String me) {
        return profileService.setPhotoVisibility(req.getVisibility(), me);
    }

    // 誰喜歡我；免費會員只回傳人數
    @GetMapping("/likers")
    public LikersResponse getLikers(@RequestAttribute(name = AuthInterceptor.MEMBER_ID, required = false) String me) {
        return memberService.getLikers(me);
    }

    @GetMapping("/verifications")
    public VerificationStatus getVerifications(@RequestAttribute(name = AuthInterceptor.MEMBER_ID, required = false) String me) {
        return verificationService.getStatus(me);
    }

    @PostMapping("/phone/send")
    public PhoneSendResponse sendPhoneCode(@RequestBody PhoneSendRequest req,
                                           @RequestAttribute(name = AuthInterceptor.MEMBER_ID, required = false) String me) {
        return verificationService.sendPhoneCode(req.getPhone(), me);
    }

    @PostMapping("/phone/verify")
    public Member verifyPhone(@RequestBody PhoneVerifyRequest req,
                              @RequestAttribute(name = AuthInterceptor.MEMBER_ID, required = false) String me) {
        return verificationService.verifyPhone(req.getCode(), me);
    }

    // 申請真人（photo）、身分（id）、財力（income）認證；multipart 欄位名稱 files，可多個
    @PostMapping("/verifications/{type}")
    public VerificationStatus submitVerification(@PathVariable String type,
                                                 @RequestParam(name = "files", required = false) List<MultipartFile> files,
                                                 @RequestAttribute(name = AuthInterceptor.MEMBER_ID, required = false) String me) {
        return verificationService.submit(type, files, me);
    }
}
