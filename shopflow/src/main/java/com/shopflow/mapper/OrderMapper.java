package com.shopflow.mapper;

import com.shopflow.dto.OrderItemResponse;
import com.shopflow.dto.OrderResponse;
import com.shopflow.entity.Order;
import com.shopflow.entity.OrderItem;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface OrderMapper {

    @Mapping(source = "deliveryAddress.id", target = "addressId")
    @Mapping(source = "status",             target = "statut")
    @Mapping(source = "user.email",         target = "customerEmail")
    OrderResponse toResponse(Order order);

    @Mapping(source = "product.id",   target = "productId")
    @Mapping(source = "product.name", target = "productNom")
    @Mapping(source = "variant.id",   target = "variantId")
    @Mapping(expression = "java(orderItem.getPrixUnitaire().multiply(java.math.BigDecimal.valueOf(orderItem.getQuantite())))", target = "sousTotal")
    OrderItemResponse toItemResponse(OrderItem orderItem);
}
