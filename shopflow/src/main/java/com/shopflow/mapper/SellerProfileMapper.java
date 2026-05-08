package com.shopflow.mapper;

import com.shopflow.dto.SellerProfileResponse;
import com.shopflow.entity.SellerProfile;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface SellerProfileMapper {

    @Mapping(source = "user.id", target = "userId")
    SellerProfileResponse toResponse(SellerProfile sellerProfile);
}
