package com.shopflow.dto;

import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class UpdateUserProfileRequest {
    @Size(max = 120, message = "Full name cannot exceed 120 characters")
    private String fullName;
    
    @Size(max = 50, message = "Phone number cannot exceed 50 characters")
    private String phone;
    
    private String avatarUrl;
}
