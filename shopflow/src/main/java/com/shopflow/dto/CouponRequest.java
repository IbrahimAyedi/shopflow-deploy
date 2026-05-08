package com.shopflow.dto;

import com.shopflow.entity.CouponType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import lombok.Data;

@Data
public class CouponRequest {

    @NotBlank
    private String code;

    @NotNull
    private CouponType type;

    @NotNull
    @Positive
    private BigDecimal valeur;

    private LocalDateTime dateExpiration;

    @PositiveOrZero
    private Integer usagesMax;

    private Boolean actif;
}
