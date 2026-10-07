package com.meetmeetme.backend.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.io.UncheckedIOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Optional;
import java.util.UUID;
import java.util.regex.Pattern;

/**
 * 認證文件（自拍、證件、財力證明）。和公開照片分開存放，
 * 不提供公開網址，只能透過管理後台的 API 讀取。
 * 部署前要換成私有的 Cloud Storage bucket。
 */
public interface DocumentStorage {
    /** 存檔並回傳 key */
    String save(byte[] content, String extension);
    Optional<byte[]> load(String key);
    String contentType(String key);
}

@Service
class LocalDocumentStorage implements DocumentStorage {

    private static final Pattern KEY = Pattern.compile("^[0-9a-f-]{36}\\.(jpg|png|webp|pdf)$");

    private final Path dir;

    LocalDocumentStorage(@Value("${app.private-dir}") String privateDir) {
        this.dir = Path.of(privateDir).toAbsolutePath().normalize();
        try {
            Files.createDirectories(dir);
        } catch (IOException e) {
            throw new UncheckedIOException(e);
        }
    }

    @Override
    public String save(byte[] content, String extension) {
        String key = UUID.randomUUID() + "." + extension;
        try {
            Files.write(dir.resolve(key), content);
        } catch (IOException e) {
            throw new UncheckedIOException(e);
        }
        return key;
    }

    @Override
    public Optional<byte[]> load(String key) {
        // 只接受自己產生的檔名格式，避免讀到資料夾以外的檔案
        if (key == null || !KEY.matcher(key).matches()) return Optional.empty();
        Path file = dir.resolve(key);
        if (!Files.exists(file)) return Optional.empty();
        try {
            return Optional.of(Files.readAllBytes(file));
        } catch (IOException e) {
            throw new UncheckedIOException(e);
        }
    }

    @Override
    public String contentType(String key) {
        if (key.endsWith(".png")) return "image/png";
        if (key.endsWith(".webp")) return "image/webp";
        if (key.endsWith(".pdf")) return "application/pdf";
        return "image/jpeg";
    }
}
