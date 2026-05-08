package com.shopflow.service;

import com.shopflow.exception.BusinessException;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Set;
import java.util.UUID;

/**
 * Stores uploaded images on disk and returns a public URL path.
 * Files are saved under {@code ./uploads/<type>/} relative to the working directory.
 */
@Service
public class ImageStorageService {

    private static final Set<String> ALLOWED_TYPES = Set.of(
            "image/jpeg", "image/png", "image/webp"
    );

    private static final long MAX_SIZE = 5 * 1024 * 1024; // 5 MB

    private final Path uploadRoot = Paths.get("uploads").toAbsolutePath();

    public ImageStorageService() {
        try {
            Files.createDirectories(uploadRoot.resolve("products"));
        } catch (IOException e) {
            throw new RuntimeException("Could not create upload directory: " + uploadRoot, e);
        }
    }

    /**
     * Saves the uploaded file and returns the relative public URL path,
     * e.g. {@code /uploads/products/abc123.jpg}.
     */
    public String store(MultipartFile file) {
        return store(file, "products");
    }

    public String storeSellerLogo(MultipartFile file) {
        return store(file, "seller-logos");
    }

    private String store(MultipartFile file, String subdirectory) {
        if (file == null || file.isEmpty()) {
            throw new BusinessException("File is empty.");
        }

        if (file.getSize() > MAX_SIZE) {
            throw new BusinessException("File exceeds maximum allowed size of 5 MB.");
        }

        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_TYPES.contains(contentType)) {
            throw new BusinessException("Only JPG, PNG, and WebP images are allowed.");
        }

        String originalFilename = file.getOriginalFilename();
        String extension = "";
        if (originalFilename != null && originalFilename.contains(".")) {
            extension = originalFilename.substring(originalFilename.lastIndexOf('.'));
        }

        String safeFilename = UUID.randomUUID().toString() + extension;

        try {
            Path targetDir = uploadRoot.resolve(subdirectory);
            Files.createDirectories(targetDir);
            Path target = targetDir.resolve(safeFilename);
            Files.copy(file.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);
        } catch (IOException e) {
            throw new RuntimeException("Failed to store file: " + safeFilename, e);
        }

        return "/uploads/" + subdirectory + "/" + safeFilename;
    }
}
