package com.shopflow.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

@Data
public class ReviewRequest {

    @NotNull
    @Positive
    private Long productId;

    @Min(1)
    @Max(5)
    private int note;

    private String commentaire;
}
