package com.shopflow.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;
import lombok.Data;

@Data
public class CategoryRequest {
    @NotBlank
    private String nom;
    private String description;
    /** Null for root categories */
    @Positive
    private Long parentId;
}
