package com.shopflow.service;

import com.shopflow.dto.CouponRequest;
import com.shopflow.dto.CouponResponse;
import com.shopflow.dto.CouponValidationResponse;
import com.shopflow.entity.Coupon;
import com.shopflow.exception.BusinessException;
import com.shopflow.exception.ResourceNotFoundException;
import com.shopflow.repository.CouponRepository;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class CouponService {

    private final CouponRepository couponRepository;

    @Transactional(readOnly = true)
    public List<CouponResponse> getCoupons() {
        return couponRepository.findAll().stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public CouponResponse createCoupon(CouponRequest request) {
        String normalizedCode = normalizeCode(request.getCode());
        if (couponRepository.existsByCode(normalizedCode)) {
            throw new BusinessException("Coupon code already exists: " + normalizedCode);
        }

        Coupon coupon = new Coupon();
        coupon.setCode(normalizedCode);
        coupon.setType(request.getType());
        coupon.setValeur(request.getValeur());
        coupon.setDateExpiration(toEntityDate(request.getDateExpiration()));
        coupon.setUsagesMax(request.getUsagesMax() != null ? request.getUsagesMax() : 0);
        coupon.setUsagesActuels(0);
        coupon.setActif(request.getActif() == null || request.getActif());

        return toResponse(couponRepository.save(coupon));
    }

    @Transactional
    public CouponResponse updateCoupon(Long id, CouponRequest request) {
        Coupon coupon = couponRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Coupon not found: " + id));

        String normalizedCode = normalizeCode(request.getCode());
        couponRepository.findByCode(normalizedCode).ifPresent(existing -> {
            if (!existing.getId().equals(id)) {
                throw new BusinessException("Coupon code already exists: " + normalizedCode);
            }
        });

        coupon.setCode(normalizedCode);
        coupon.setType(request.getType());
        coupon.setValeur(request.getValeur());
        coupon.setDateExpiration(toEntityDate(request.getDateExpiration()));
        coupon.setUsagesMax(request.getUsagesMax() != null ? request.getUsagesMax() : 0);
        if (request.getActif() != null) {
            coupon.setActif(request.getActif());
        }

        return toResponse(couponRepository.save(coupon));
    }

    @Transactional
    public void deleteCoupon(Long id) {
        Coupon coupon = couponRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Coupon not found: " + id));
        // Safe soft-delete to avoid breaking historical order/cart references.
        coupon.setActif(false);
        couponRepository.save(coupon);
    }

    @Transactional(readOnly = true)
    public CouponValidationResponse validateCoupon(String code) {
        String normalizedCode = normalizeCode(code);
        CouponValidationResponse response = new CouponValidationResponse();
        response.setCode(normalizedCode);

        Coupon coupon = couponRepository.findByCode(normalizedCode).orElse(null);
        if (coupon == null) {
            response.setValid(false);
            response.setMessage("Coupon not found");
            return response;
        }

        if (!coupon.isActif()) {
            response.setValid(false);
            response.setMessage("Coupon is inactive");
            return response;
        }

        if (coupon.getDateExpiration() != null && coupon.getDateExpiration().isBefore(LocalDate.now())) {
            response.setValid(false);
            response.setMessage("Coupon has expired");
            return response;
        }

        if (coupon.getUsagesMax() > 0 && coupon.getUsagesActuels() >= coupon.getUsagesMax()) {
            response.setValid(false);
            response.setMessage("Coupon usage limit reached");
            return response;
        }

        response.setValid(true);
        response.setMessage("Coupon is valid");
        response.setCoupon(toResponse(coupon));
        return response;
    }

    private String normalizeCode(String code) {
        return code == null ? null : code.trim().toUpperCase();
    }

    private LocalDate toEntityDate(LocalDateTime value) {
        return value == null ? null : value.toLocalDate();
    }

    private CouponResponse toResponse(Coupon coupon) {
        CouponResponse response = new CouponResponse();
        response.setId(coupon.getId());
        response.setCode(coupon.getCode());
        response.setType(coupon.getType());
        response.setValeur(coupon.getValeur());
        response.setDateExpiration(coupon.getDateExpiration() == null ? null : coupon.getDateExpiration().atStartOfDay());
        response.setUsagesMax(coupon.getUsagesMax());
        response.setUsagesActuels(coupon.getUsagesActuels());
        response.setActif(coupon.isActif());
        return response;
    }
}
