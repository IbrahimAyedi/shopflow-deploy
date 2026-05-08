package com.shopflow.controller;

import com.shopflow.dto.SellerProfileRequest;
import com.shopflow.dto.SellerProfileResponse;
import com.shopflow.entity.User;
import com.shopflow.repository.UserRepository;
import com.shopflow.service.SellerProfileService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/seller/profile")
public class SellerProfileController {

    private final SellerProfileService sellerProfileService;
    private final UserRepository userRepository;

    public SellerProfileController(SellerProfileService sellerProfileService, UserRepository userRepository) {
        this.sellerProfileService = sellerProfileService;
        this.userRepository = userRepository;
    }

    @GetMapping
    @PreAuthorize("hasRole('SELLER')")
    public ResponseEntity<SellerProfileResponse> getMyProfile() {
        return ResponseEntity.ok(sellerProfileService.getProfileByUserId(getCurrentUserId()));
    }

    @PutMapping
    @PreAuthorize("hasRole('SELLER')")
    public ResponseEntity<SellerProfileResponse> createOrUpdate(@Valid @RequestBody SellerProfileRequest request) {
        return ResponseEntity.ok(sellerProfileService.createOrUpdateProfile(getCurrentUserId(), request));
    }

    private Long getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || authentication.getPrincipal() == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Unauthorized");
        }

        Object principal = authentication.getPrincipal();
        String email;
        if (principal instanceof UserDetails userDetails) {
            email = userDetails.getUsername();
        } else if (principal instanceof String principalString) {
            email = principalString;
        } else {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Unauthorized");
        }

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"));
        return user.getId();
    }
}
