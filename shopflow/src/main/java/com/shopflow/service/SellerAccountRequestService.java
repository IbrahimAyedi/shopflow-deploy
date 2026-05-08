package com.shopflow.service;

import com.shopflow.dto.SellerAccountRequestCreateRequest;
import com.shopflow.dto.SellerAccountRequestDecisionRequest;
import com.shopflow.dto.SellerAccountRequestResponse;
import com.shopflow.entity.Role;
import com.shopflow.entity.SellerAccountRequest;
import com.shopflow.entity.SellerProfile;
import com.shopflow.entity.SellerRequestStatus;
import com.shopflow.entity.User;
import com.shopflow.repository.SellerAccountRequestRepository;
import com.shopflow.repository.SellerProfileRepository;
import com.shopflow.repository.UserRepository;
import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
@RequiredArgsConstructor
public class SellerAccountRequestService {

    private final SellerAccountRequestRepository sellerAccountRequestRepository;
    private final UserRepository userRepository;
    private final SellerProfileRepository sellerProfileRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional
    public SellerAccountRequestResponse createRequest(SellerAccountRequestCreateRequest request) {
        String email = normalizeEmail(request.email());

        if (sellerAccountRequestRepository.existsByEmailIgnoreCaseAndStatus(email, SellerRequestStatus.PENDING)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "A pending seller request already exists for this email.");
        }

        userRepository.findByEmailIgnoreCase(email)
                .filter(User::isActive)
                .ifPresent(user -> {
                    throw new ResponseStatusException(HttpStatus.CONFLICT, "An active account with this email already exists.");
                });

        SellerAccountRequest sellerRequest = SellerAccountRequest.builder()
                .fullName(request.fullName().trim())
                .email(email)
                .phone(request.phone().trim())
                .shopName(request.shopName().trim())
                .shopDescription(trimToNull(request.shopDescription()))
                .address(trimToNull(request.address()))
                .message(trimToNull(request.message()))
                .status(SellerRequestStatus.PENDING)
                .build();

        return toResponse(sellerAccountRequestRepository.save(sellerRequest), null, null);
    }

    @Transactional(readOnly = true)
    public List<SellerAccountRequestResponse> listRequests() {
        return sellerAccountRequestRepository.findAll().stream()
                .sorted(requestComparator())
                .map(request -> toResponse(request, null, null))
                .toList();
    }

    @Transactional(readOnly = true)
    public List<SellerAccountRequestResponse> listPendingRequests() {
        return sellerAccountRequestRepository.findByStatus(SellerRequestStatus.PENDING).stream()
                .sorted(requestComparator())
                .map(request -> toResponse(request, null, null))
                .toList();
    }

    @Transactional
    public SellerAccountRequestResponse approveRequest(Long id, SellerAccountRequestDecisionRequest decisionRequest) {
        SellerAccountRequest request = findRequest(id);
        requirePending(request);

        String email = normalizeEmail(request.getEmail());
        String temporaryPassword = email;

        User seller = userRepository.findByEmailIgnoreCase(email)
                .map(existingUser -> activateExistingSeller(existingUser, request, temporaryPassword))
                .orElseGet(() -> createSellerUser(request, temporaryPassword));

        SellerProfile profile = sellerProfileRepository.findByUserId(seller.getId())
                .orElseGet(() -> SellerProfile.builder().user(seller).build());
        profile.setUser(seller);
        profile.setNomBoutique(request.getShopName());
        profile.setDescription(trimToNull(request.getShopDescription()));
        profile.setAddress(trimToNull(request.getAddress()));
        sellerProfileRepository.save(profile);

        request.setStatus(SellerRequestStatus.APPROVED);
        request.setReviewedAt(LocalDateTime.now());
        request.setReviewNote(trimToNull(decisionRequest != null ? decisionRequest.reviewNote() : null));

        SellerAccountRequest savedRequest = sellerAccountRequestRepository.save(request);
        return toResponse(savedRequest, email, temporaryPassword);
    }

    @Transactional
    public SellerAccountRequestResponse rejectRequest(Long id, SellerAccountRequestDecisionRequest decisionRequest) {
        SellerAccountRequest request = findRequest(id);
        requirePending(request);

        request.setStatus(SellerRequestStatus.REJECTED);
        request.setReviewedAt(LocalDateTime.now());
        request.setReviewNote(trimToNull(decisionRequest != null ? decisionRequest.reviewNote() : null));

        return toResponse(sellerAccountRequestRepository.save(request), null, null);
    }

    private SellerAccountRequest findRequest(Long id) {
        return sellerAccountRequestRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Seller request not found: " + id));
    }

    private void requirePending(SellerAccountRequest request) {
        if (request.getStatus() != SellerRequestStatus.PENDING) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Only pending seller requests can be reviewed.");
        }
    }

    private User createSellerUser(SellerAccountRequest request, String temporaryPassword) {
        User seller = User.builder()
                .email(normalizeEmail(request.getEmail()))
                .password(passwordEncoder.encode(temporaryPassword))
                .role(Role.SELLER)
                .active(true)
                .fullName(trimToNull(request.getFullName()))
                .phone(trimToNull(request.getPhone()))
                .build();

        return userRepository.save(seller);
    }

    private User activateExistingSeller(User user, SellerAccountRequest request, String temporaryPassword) {
        if (user.getRole() != Role.SELLER) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "This email belongs to a non-seller account.");
        }

        user.setActive(true);
        user.setPassword(passwordEncoder.encode(temporaryPassword));
        user.setFullName(trimToNull(request.getFullName()));
        user.setPhone(trimToNull(request.getPhone()));
        return userRepository.save(user);
    }

    private Comparator<SellerAccountRequest> requestComparator() {
        return Comparator
                .comparing((SellerAccountRequest request) -> request.getStatus() != SellerRequestStatus.PENDING)
                .thenComparing(SellerAccountRequest::getCreatedAt, Comparator.nullsLast(Comparator.reverseOrder()));
    }

    private SellerAccountRequestResponse toResponse(
            SellerAccountRequest request,
            String sellerEmail,
            String temporaryPassword
    ) {
        return new SellerAccountRequestResponse(
                request.getId(),
                request.getFullName(),
                request.getEmail(),
                request.getPhone(),
                request.getShopName(),
                request.getShopDescription(),
                request.getAddress(),
                request.getMessage(),
                request.getStatus(),
                request.getCreatedAt(),
                request.getReviewedAt(),
                request.getReviewNote(),
                sellerEmail,
                temporaryPassword
        );
    }

    private String normalizeEmail(String value) {
        return value.trim().toLowerCase();
    }

    private String trimToNull(String value) {
        if (value == null) {
            return null;
        }

        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }
}
