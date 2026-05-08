package com.shopflow.service;

import com.shopflow.dto.SellerProfileRequest;
import com.shopflow.dto.SellerProfileResponse;
import com.shopflow.entity.SellerProfile;
import com.shopflow.entity.User;
import com.shopflow.exception.ResourceNotFoundException;
import com.shopflow.mapper.SellerProfileMapper;
import com.shopflow.repository.SellerProfileRepository;
import com.shopflow.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class SellerProfileService {

    private final SellerProfileRepository sellerProfileRepository;
    private final UserRepository          userRepository;
    private final SellerProfileMapper     sellerProfileMapper;

    // ─── Create or Update (upsert) ─────────────────────────────────────────

    @Transactional
    public SellerProfileResponse createOrUpdateProfile(Long userId, SellerProfileRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userId));

        SellerProfile profile = sellerProfileRepository.findByUserId(userId)
                .orElseGet(() -> {
                    SellerProfile newProfile = new SellerProfile();
                    newProfile.setUser(user);
                    return newProfile;
                });

        profile.setNomBoutique(request.getNomBoutique());
        profile.setDescription(request.getDescription());
        profile.setLogo(request.getLogo());

        return sellerProfileMapper.toResponse(sellerProfileRepository.save(profile));
    }

    // ─── Read ───────────────────────────────────────────────────────────────

    public SellerProfileResponse getProfileByUserId(Long userId) {
        SellerProfile profile = sellerProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Seller profile not found for user: " + userId));
        return sellerProfileMapper.toResponse(profile);
    }
}
