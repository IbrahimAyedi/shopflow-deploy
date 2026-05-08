package com.shopflow.dto;

import com.shopflow.entity.Role;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class UserProfileResponse {
    private Long id;
    private String email;
    private Role role;
    private boolean active;
    private String fullName;
    private String phone;
    private String avatarUrl;
}
