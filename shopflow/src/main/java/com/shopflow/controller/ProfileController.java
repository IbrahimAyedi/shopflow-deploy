package com.shopflow.controller;

import com.shopflow.dto.UpdateUserProfileRequest;
import com.shopflow.dto.UserProfileResponse;
import com.shopflow.service.ProfileService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/profile")
@RequiredArgsConstructor
public class ProfileController {

    private final ProfileService profileService;

    @GetMapping
    public ResponseEntity<UserProfileResponse> getProfile(Authentication authentication) {
        return ResponseEntity.ok(profileService.getProfile(authentication.getName()));
    }

    @PutMapping
    public ResponseEntity<UserProfileResponse> updateProfile(
            Authentication authentication,
            @Valid @RequestBody UpdateUserProfileRequest request) {
        return ResponseEntity.ok(profileService.updateProfile(authentication.getName(), request));
    }

    @PatchMapping("/deactivate")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<Void> deactivateProfile(Authentication authentication) {
        profileService.deactivateProfile(authentication.getName());
        return ResponseEntity.noContent().build();
    }
}
