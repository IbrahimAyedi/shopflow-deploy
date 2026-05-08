package com.shopflow.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

@Data
public class CartItemRequest {

    @NotNull
    @Positive
    private Long productId;
    /** Null if customer did not choose a specific variant */
    @Positive
    private Long variantId;

    @Positive
    private int quantite;
}

