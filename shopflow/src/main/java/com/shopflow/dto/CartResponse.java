package com.shopflow.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.util.List;

@Data
public class CartResponse {
    private Long id;
    private List<CartItemResponse> items;
    /** Null when no coupon applied */
    private String couponCode;
    private BigDecimal sousTotal;
    private BigDecimal remise;
    private BigDecimal fraisLivraison;
    private BigDecimal totalTTC;
}
