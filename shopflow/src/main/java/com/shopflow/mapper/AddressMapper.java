package com.shopflow.mapper;

import com.shopflow.dto.AddressResponse;
import com.shopflow.entity.Address;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface AddressMapper {

    AddressResponse toResponse(Address address);
}
