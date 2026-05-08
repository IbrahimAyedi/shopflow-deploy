package com.shopflow.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "coupons")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Coupon {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Unique code entered by the customer, e.g. "SUMMER20" */
    @Column(nullable = false, unique = true)
    private String code;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private CouponType type;

    /** Discount value — percentage (0–100) for PERCENT, absolute amount for FIXED */
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal valeur;

    /** Date after which the coupon is no longer valid */
    private LocalDate dateExpiration;

    /** Maximum number of times this coupon can be used in total */
    @Column(nullable = false)
    @Builder.Default
    private int usagesMax = 1;

    /** Counter of how many times the coupon has been used */
    @Column(nullable = false)
    @Builder.Default
    private int usagesActuels = 0;

    /** Whether the coupon is currently enabled */
    @Column(nullable = false)
    @Builder.Default
    private boolean actif = true;
}
