package com.shopflow.dto;

import com.shopflow.entity.SellerRequestStatus;
import java.time.LocalDateTime;

public record SellerAccountRequestResponse(
        Long id,
        String fullName,
        String email,
        String phone,
        String shopName,
        String shopDescription,
        String address,
        String message,
        SellerRequestStatus status,
        LocalDateTime createdAt,
        LocalDateTime reviewedAt,
        String reviewNote,
        String sellerEmail,
        String temporaryPassword
) {
}
