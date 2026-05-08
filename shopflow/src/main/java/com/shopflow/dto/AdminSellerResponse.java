package com.shopflow.dto;

import com.shopflow.entity.Role;

public record AdminSellerResponse(
        Long userId,
        String email,
        String fullName,
        String phone,
        Role role,
        boolean active,
        Long sellerProfileId,
        String shopName,
        String description,
        String address,
        String logoUrl
) {
}