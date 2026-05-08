package com.shopflow.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class SellerProfileRequest {
    @NotBlank
    private String nomBoutique;
    private String description;
    private String logo;
}
