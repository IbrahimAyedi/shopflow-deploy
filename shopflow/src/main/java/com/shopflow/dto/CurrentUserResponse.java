package com.shopflow.dto;

import com.shopflow.entity.Role;
import lombok.Data;

@Data
public class CurrentUserResponse {
    private Long userId;
    private String email;
    private Role role;
    private boolean active;
}
