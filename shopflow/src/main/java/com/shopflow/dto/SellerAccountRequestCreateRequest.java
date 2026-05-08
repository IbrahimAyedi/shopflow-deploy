package com.shopflow.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record SellerAccountRequestCreateRequest(
        @NotBlank String fullName,
        @Email @NotBlank String email,
        @NotBlank String phone,
        @NotBlank String shopName,
        String shopDescription,
        String address,
        String message
) {
}
