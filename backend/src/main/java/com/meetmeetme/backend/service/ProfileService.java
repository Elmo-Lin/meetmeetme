package com.meetmeetme.backend.service;

import com.meetmeetme.backend.dao.MemberDao;
import com.meetmeetme.backend.model.Member;
import com.meetmeetme.backend.model.ProfileRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.UncheckedIOException;
import java.util.LinkedHashSet;
import java.util.List;

// 編輯自己的個人資料與照片
public interface ProfileService {
    Member updateProfile(ProfileRequest req, String me);
    Member addPhoto(MultipartFile file, String me);
    Member removePhoto(String url, String me);
    Member setCoverPhoto(String url, String me);
    Member setPhotoVisibility(String visibility, String me);
}

@Service
class ProfileServiceImpl implements ProfileService {

    private static final int MAX_PHOTOS = 6;
    private static final int MAX_TAGS = 10;

    @Autowired
    private MemberDao memberDao;

    @Autowired
    private MemberService memberService;

    @Autowired
    private PhotoStorage photoStorage;

    @Override
    public Member updateProfile(ProfileRequest req, String me) {
        Errors.requireMe(me);
        req.setNickname(trim(req.getNickname()));
        req.setJob(trim(req.getJob()));
        req.setEducation(trim(req.getEducation()));
        req.setIntro(trim(req.getIntro()));
        req.setExpectation(trim(req.getExpectation()));
        req.setTags(cleanTags(req.getTags()));
        validate(req);
        memberDao.updateProfile(me, req);
        return memberService.getMe(me);
    }

    @Override
    public Member addPhoto(MultipartFile file, String me) {
        Member member = memberService.getMe(me);
        if (member.getPhotos().size() >= MAX_PHOTOS) throw Errors.badRequest("最多只能上傳 " + MAX_PHOTOS + " 張照片");
        if (file == null || file.isEmpty()) throw Errors.badRequest("請選擇照片");

        byte[] content;
        try {
            content = file.getBytes();
        } catch (IOException e) {
            throw new UncheckedIOException(e);
        }
        // 看檔案內容判斷格式，不相信副檔名
        String extension = ImageTypes.detect(content, false);
        if (extension == null) throw Errors.badRequest("只支援 JPG、PNG、WebP 格式的照片");

        String url = photoStorage.save(content, extension);
        if (!memberDao.appendPhoto(me, url, MAX_PHOTOS)) {
            // 同時上傳多張剛好超過上限
            photoStorage.delete(url);
            throw Errors.badRequest("最多只能上傳 " + MAX_PHOTOS + " 張照片");
        }
        return memberService.getMe(me);
    }

    @Override
    public Member removePhoto(String url, String me) {
        Errors.requireMe(me);
        if (!memberDao.removePhoto(me, url)) throw Errors.notFound();
        photoStorage.delete(url);
        return memberService.getMe(me);
    }

    @Override
    public Member setCoverPhoto(String url, String me) {
        Errors.requireMe(me);
        if (!memberDao.setCoverPhoto(me, url)) throw Errors.notFound();
        return memberService.getMe(me);
    }

    @Override
    public Member setPhotoVisibility(String visibility, String me) {
        Errors.requireMe(me);
        if (!"MEMBERS".equals(visibility) && !"LIKED".equals(visibility)) throw Errors.badRequest("照片可見度設定不正確");
        memberDao.updatePhotoVisibility(me, visibility);
        return memberService.getMe(me);
    }

    private static void validate(ProfileRequest req) {
        if (req.getNickname() == null || req.getNickname().length() > 20) throw Errors.badRequest("暱稱需為 1–20 字");
        if (!Options.CITIES.contains(req.getCity())) throw Errors.badRequest("請選擇所在地區");
        if (req.getJob() != null && req.getJob().length() > 30) throw Errors.badRequest("職業最多 30 字");
        if (req.getHeightCm() != null && (req.getHeightCm() < 140 || req.getHeightCm() > 220)) throw Errors.badRequest("身高請填 140–220 公分");
        if (req.getEducation() != null && !Options.EDUCATIONS.contains(req.getEducation())) throw Errors.badRequest("請選擇學歷");
        if (!Options.BUDGETS.contains(req.getBudget())) throw Errors.badRequest("請選擇預算區間");
        if (!Options.FREQUENCIES.contains(req.getFrequency())) throw Errors.badRequest("請選擇見面頻率");
        if (req.getRelationshipTypes() == null || req.getRelationshipTypes().isEmpty()
                || !Options.RELATIONSHIP_TYPES.containsAll(req.getRelationshipTypes())) throw Errors.badRequest("請選擇關係類型");
        if (req.getTags().size() > MAX_TAGS) throw Errors.badRequest("興趣最多 " + MAX_TAGS + " 個");
        if (req.getTags().stream().anyMatch(t -> t.length() > 10)) throw Errors.badRequest("每個興趣最多 10 字");
        if (req.getIntro() != null && req.getIntro().length() > 500) throw Errors.badRequest("自我介紹最多 500 字");
        if (req.getExpectation() != null && req.getExpectation().length() > 200) throw Errors.badRequest("期待說明最多 200 字");
    }

    // 空字串一律當成沒填
    private static String trim(String s) {
        if (s == null) return null;
        String t = s.trim();
        return t.isEmpty() ? null : t;
    }

    // 去掉空白與重複；逗號是資料庫陣列的分隔符號，不能出現在興趣裡
    private static List<String> cleanTags(List<String> tags) {
        if (tags == null) return List.of();
        LinkedHashSet<String> set = new LinkedHashSet<>();
        for (String t : tags) {
            String v = trim(t == null ? null : t.replace(",", ""));
            if (v != null) set.add(v);
        }
        return List.copyOf(set);
    }
}
