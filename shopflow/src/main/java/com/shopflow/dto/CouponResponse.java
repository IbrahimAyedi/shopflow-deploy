package com.shopflow.dto;

import com.shopflow.entity.CouponType;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import lombok.Data;

@Data
public class CouponResponse {

    private Long id;
    private String code;
    private CouponType type;
    private BigDecimal valeur;
    private LocalDateTime dateExpiration;
    private Integer usagesMax;
    private Integer usagesActuels;
    private Boolean actif;
}
