package com.shopflow.controller;

import com.shopflow.dto.AdminSellerResponse;
import com.shopflow.dto.CreateSellerRequest;
import com.shopflow.dto.UpdateUserActiveRequest;
import com.shopflow.service.ImageStorageService;
import com.shopflow.service.AdminSellerService;
import jakarta.validation.Valid;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/admin/sellers")
@PreAuthorize("hasRole('ADMIN')")
public class AdminSellerController {

    private final AdminSellerService adminSellerService;
    private final ImageStorageService imageStorageService;

    @GetMapping
    public ResponseEntity<List<AdminSellerResponse>> getSellers() {
        return ResponseEntity.ok(adminSellerService.getSellers());
    }

    @PostMapping
    public ResponseEntity<AdminSellerResponse> createSeller(@Valid @RequestBody CreateSellerRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(adminSellerService.createSeller(request));
    }

        @PatchMapping("/{id}/active")
    public ResponseEntity<AdminSellerResponse> updateSellerActive(
            @PathVariable Long id,
            @Valid @RequestBody UpdateUserActiveRequest request
    ) {
        return ResponseEntity.ok(adminSellerService.updateSellerActive(id, request.isActive()));
    }

    @PostMapping(value = "/upload-logo", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public Map<String, String> uploadLogo(@RequestParam("file") MultipartFile file) {
        String imageUrl = imageStorageService.storeSellerLogo(file);
        return Map.of("imageUrl", imageUrl);
    }
}
