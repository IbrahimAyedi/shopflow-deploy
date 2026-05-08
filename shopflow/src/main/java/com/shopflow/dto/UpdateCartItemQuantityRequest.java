package com.shopflow.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

@Data
public class UpdateCartItemQuantityRequest {

    @NotNull
    @Positive
    private Integer quantite;
}
