package com.shopflow.mapper;

import com.shopflow.dto.CategoryResponse;
import com.shopflow.entity.Category;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface CategoryMapper {

    @Mapping(source = "parent.id", target = "parentId")
    CategoryResponse toResponse(Category category);
}
