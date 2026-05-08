package com.shopflow.mapper;

import com.shopflow.dto.ProductRequest;
import com.shopflow.dto.ProductResponse;
import com.shopflow.entity.Product;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

/**
 * MapStruct mapper for the Product entity.
 *
 * <p>componentModel = "spring" causes MapStruct to generate a Spring bean, allowing
 * the mapper to be injected with @Autowired / constructor injection.
 *
 * <p>The generated implementation class is created at compile-time in the
 * target/generated-sources directory.
 */
@Mapper(componentModel = "spring")
public interface ProductMapper {

    /**
     * Maps a Product entity to a ProductResponse DTO.
     * Simple fields auto-map by name; categories are projected manually.
     */
    @Mapping(target = "categoryIds",
             expression = "java(product.getCategories().stream().map(com.shopflow.entity.Category::getId).collect(java.util.stream.Collectors.toList()))")
    @Mapping(target = "categoryNames",
             expression = "java(product.getCategories().stream().map(com.shopflow.entity.Category::getNom).collect(java.util.stream.Collectors.toList()))")
    @Mapping(target = "sellerId", expression = "java(resolveSellerId(product))")
    @Mapping(target = "sellerName", expression = "java(resolveSellerName(product))")
    @Mapping(target = "sellerShopName", expression = "java(resolveSellerShopName(product))")
    @Mapping(target = "sellerLogoUrl", expression = "java(resolveSellerLogoUrl(product))")
    ProductResponse toResponse(Product product);

    /**
     * Maps a ProductRequest DTO to a new Product entity.
     * The 'id' field on the entity must NOT be set from the request.
     */
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "prixPromo", ignore = true)
    @Mapping(target = "actif", ignore = true)
    @Mapping(target = "note", ignore = true)
    @Mapping(target = "dateCreation", ignore = true)
    @Mapping(target = "seller", ignore = true)
    @Mapping(target = "categories", ignore = true)
    @Mapping(target = "variants", ignore = true)
    @Mapping(target = "reviews", ignore = true)
    Product toEntity(ProductRequest request);

    /**
     * Updates an existing Product entity in-place from a ProductRequest.
     * Use this for PUT / PATCH update operations.
     */
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "prixPromo", ignore = true)
    @Mapping(target = "actif", ignore = true)
    @Mapping(target = "note", ignore = true)
    @Mapping(target = "dateCreation", ignore = true)
    @Mapping(target = "seller", ignore = true)
    @Mapping(target = "categories", ignore = true)
    @Mapping(target = "variants", ignore = true)
    @Mapping(target = "reviews", ignore = true)
    void updateEntityFromRequest(ProductRequest request, @MappingTarget Product product);

    default Long resolveSellerId(Product product) {
        return product != null && product.getSeller() != null ? product.getSeller().getId() : null;
    }

    default String resolveSellerName(Product product) {
        if (product == null || product.getSeller() == null) {
            return null;
        }

        var seller = product.getSeller();
        if (seller.getFullName() != null && !seller.getFullName().isBlank()) {
            return seller.getFullName();
        }

        return seller.getEmail();
    }

    default String resolveSellerShopName(Product product) {
        if (product == null || product.getSeller() == null) {
            return null;
        }

        var seller = product.getSeller();
        if (seller.getSellerProfile() != null) {
            var sellerProfile = seller.getSellerProfile();
            if (sellerProfile.getNomBoutique() != null && !sellerProfile.getNomBoutique().isBlank()) {
                return sellerProfile.getNomBoutique();
            }
        }

        if (seller.getFullName() != null && !seller.getFullName().isBlank()) {
            return seller.getFullName();
        }

        return seller.getEmail();
    }

    default String resolveSellerLogoUrl(Product product) {
        if (product == null || product.getSeller() == null) {
            return null;
        }

        var seller = product.getSeller();
        if (seller.getSellerProfile() != null && seller.getSellerProfile().getLogo() != null && !seller.getSellerProfile().getLogo().isBlank()) {
            return seller.getSellerProfile().getLogo();
        }

        if (seller.getAvatarUrl() != null && !seller.getAvatarUrl().isBlank()) {
            return seller.getAvatarUrl();
        }

        return null;
    }
}
