package com.shopflow.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record CreateSellerRequest(
        @Email @NotBlank String email,
        @NotBlank String password,
        String fullName,
        String phone,
        @NotBlank String shopName,
        String description,
        String address,
        String logoUrl,
        Boolean active
) {
}