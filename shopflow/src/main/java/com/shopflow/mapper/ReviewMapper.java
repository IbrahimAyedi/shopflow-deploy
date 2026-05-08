package com.shopflow.mapper;

import com.shopflow.dto.ReviewResponse;
import com.shopflow.entity.Review;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface ReviewMapper {

    @Mapping(source = "customer.id", target = "userId")
    @Mapping(source = "product.id",  target = "productId")
    @Mapping(source = "customer.email", target = "customerEmail")
    @Mapping(source = "customer.fullName", target = "customerName")
    ReviewResponse toResponse(Review review);
}
