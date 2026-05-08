package com.shopflow.dto;

import com.shopflow.entity.Role;

public record AuthResponse(
        String token,
        Long userId,
        String email,
        Role role
) {
}
