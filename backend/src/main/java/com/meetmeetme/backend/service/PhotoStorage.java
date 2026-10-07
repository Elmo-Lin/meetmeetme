package com.meetmeetme.backend.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.io.UncheckedIOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.UUID;

/**
 * 照片存放位置。目前存在本機資料夾，網址為 /api/uploads/檔名。
 * 注意：Cloud Run 的檔案系統重啟就會清空，部署前要換成 Cloud Storage 的實作。
 */
public interface PhotoStorage {
    /** 存檔並回傳網址 */
    String save(byte[] content, String extension);
    /** 刪除；不是本服務存的網址就忽略 */
    void delete(String url);
}

@Service
class LocalPhotoStorage implements PhotoStorage {

    static final String URL_PREFIX = "/api/uploads/";

    private final Path dir;

    LocalPhotoStorage(@Value("${app.upload-dir}") String uploadDir) {
        this.dir = Path.of(uploadDir).toAbsolutePath().normalize();
        try {
            Files.createDirectories(dir);
        } catch (IOException e) {
            throw new UncheckedIOException(e);
        }
    }

    @Override
    public String save(byte[] content, String extension) {
        String name = UUID.randomUUID() + "." + extension;
        try {
            Files.write(dir.resolve(name), content);
        } catch (IOException e) {
            throw new UncheckedIOException(e);
        }
        return URL_PREFIX + name;
    }

    @Override
    public void delete(String url) {
        if (url == null || !url.startsWith(URL_PREFIX)) return;
        Path file = dir.resolve(url.substring(URL_PREFIX.length())).normalize();
        // 避免 ../ 跑出上傳資料夾
        if (!file.startsWith(dir)) return;
        try {
            Files.deleteIfExists(file);
        } catch (IOException e) {
            throw new UncheckedIOException(e);
        }
    }
}
