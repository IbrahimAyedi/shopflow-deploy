package com.shopflow.dto;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class OrderItemResponse {
    private Long productId;
    private String productNom;
    /** Null when no variant selected */
    private Long variantId;
    private int quantite;
    private BigDecimal prixUnitaire;
    private BigDecimal sousTotal;
}
