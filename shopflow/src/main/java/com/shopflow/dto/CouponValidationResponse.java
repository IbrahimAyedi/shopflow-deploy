package com.shopflow.dto;

import lombok.Data;

@Data
public class CouponValidationResponse {

    private String code;
    private boolean valid;
    private String message;
    private CouponResponse coupon;
}
