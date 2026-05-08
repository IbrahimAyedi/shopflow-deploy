package com.shopflow.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public record ProductResponse(
        Long id,
        String name,
        BigDecimal price,
        BigDecimal prixPromo,
        Integer quantity,
        boolean actif,
        Double note,
        LocalDateTime dateCreation,
        String imageUrl,
        Long sellerId,
        String sellerName,
        String sellerShopName,
        String sellerLogoUrl,
        List<Long> categoryIds,
        List<String> categoryNames
) {
}
