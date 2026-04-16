package com.sliit.smartcampus.service;

import com.sliit.smartcampus.exception.FileValidationException;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Set;
import java.util.UUID;

@Service
public class FileStorageService {
    @Value("${app.upload.dir:./uploads/tickets}")
    private String uploadDir;

    private static final Set<String> ALLOWED_TYPES = Set.of(
        "image/jpeg", "image/png", "image/gif", "image/webp",
        "application/pdf"
    );
    private static final long MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

    @PostConstruct
    public void init() throws IOException {
        Path dir = Paths.get(uploadDir).toAbsolutePath().normalize();
        Files.createDirectories(dir);
        // Normalize uploadDir to absolute path so store() always resolves correctly
        uploadDir = dir.toString();
    }

    public String store(MultipartFile file) throws IOException {
        if (file.isEmpty()) throw new FileValidationException("File is empty");
        if (!ALLOWED_TYPES.contains(file.getContentType()))
            throw new FileValidationException("File type not allowed. Allowed: JPEG, PNG, GIF, WebP, PDF");
        if (file.getSize() > MAX_FILE_SIZE)
            throw new FileValidationException("File size exceeds 5MB limit");

        // Sanitize original filename — strip path separators and non-safe chars
        String originalName = file.getOriginalFilename();
        String safeName = (originalName != null)
            ? originalName.replaceAll("[^a-zA-Z0-9._-]", "_")
            : "file";

        // Prevent path traversal by resolving against base dir and checking prefix
        String filename = UUID.randomUUID() + "_" + safeName;
        Path uploadPath = Paths.get(uploadDir).toAbsolutePath().normalize();
        Path target = uploadPath.resolve(filename).normalize();

        // Security check: ensure resolved path is still inside uploadDir
        if (!target.startsWith(uploadPath)) {
            throw new FileValidationException("Invalid file path");
        }

        Files.copy(file.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);
        return filename;
    }
}

