package com.shopflow.service;

import com.shopflow.dto.AdminSellerResponse;
import com.shopflow.dto.CreateSellerRequest;
import com.shopflow.dto.UpdateUserActiveRequest;
import com.shopflow.entity.Role;
import com.shopflow.entity.SellerProfile;
import com.shopflow.entity.User;
import com.shopflow.repository.SellerProfileRepository;
import com.shopflow.repository.UserRepository;
import java.util.List;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
@RequiredArgsConstructor
public class AdminSellerService {

    private final UserRepository userRepository;
    private final SellerProfileRepository sellerProfileRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional(readOnly = true)
    public List<AdminSellerResponse> getSellers() {
        return userRepository.findByRole(Role.SELLER).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public AdminSellerResponse createSeller(CreateSellerRequest request) {
        if (userRepository.findByEmail(request.email()).isPresent()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "A user with this email already exists.");
        }

        User user = User.builder()
                .email(request.email().trim())
                .password(passwordEncoder.encode(request.password()))
                .role(Role.SELLER)
                .active(request.active() == null || request.active())
                .fullName(trimToNull(request.fullName()))
                .phone(trimToNull(request.phone()))
                .build();
        User savedUser = userRepository.save(user);

        SellerProfile profile = SellerProfile.builder()
                .user(savedUser)
                .nomBoutique(request.shopName().trim())
                .description(trimToNull(request.description()))
                .address(trimToNull(request.address()))
                .logo(trimToNull(request.logoUrl()))
                .build();
        SellerProfile savedProfile = sellerProfileRepository.save(profile);

        return toResponse(savedUser, savedProfile);
    }

    @Transactional
    public AdminSellerResponse updateSellerActive(Long sellerId, boolean active) {
        User user = userRepository.findById(sellerId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Seller not found: " + sellerId));

        if (user.getRole() != Role.SELLER) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "User is not a seller.");
        }

        user.setActive(active);
        User savedUser = userRepository.save(user);
        return toResponse(savedUser);
    }

    private AdminSellerResponse toResponse(User user) {
        SellerProfile profile = user.getSellerProfile();
        return toResponse(user, profile);
    }

    private AdminSellerResponse toResponse(User user, SellerProfile profile) {
        return new AdminSellerResponse(
                user.getId(),
                user.getEmail(),
                user.getFullName(),
                user.getPhone(),
                user.getRole(),
                user.isActive(),
                profile != null ? profile.getId() : null,
                profile != null ? profile.getNomBoutique() : null,
                profile != null ? profile.getDescription() : null,
                profile != null ? profile.getAddress() : null,
                profile != null ? profile.getLogo() : null
        );
    }

    private String trimToNull(String value) {
        if (value == null) {
            return null;
        }

        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }
}