package com.shopflow.mapper;

import com.shopflow.dto.CartItemResponse;
import com.shopflow.entity.CartItem;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

/**
 * Maps CartItem entity → CartItemResponse DTO.
 * Computed fields (prixUnitaire, sousTotal) are set manually in CartService.
 */
@Mapper(componentModel = "spring")
public interface CartMapper {

    @Mapping(source = "product.id",   target = "productId")
    @Mapping(source = "product.name", target = "productNom")
    @Mapping(source = "variant.id",   target = "variantId")
    @Mapping(target = "prixUnitaire", ignore = true)
    @Mapping(target = "sousTotal",    ignore = true)
    CartItemResponse toItemResponse(CartItem cartItem);
}
