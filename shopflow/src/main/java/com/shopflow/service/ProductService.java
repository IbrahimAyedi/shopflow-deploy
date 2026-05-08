package com.shopflow.service;

import com.shopflow.dto.ProductRequest;
import com.shopflow.dto.ProductResponse;
import com.shopflow.entity.Category;
import com.shopflow.entity.Product;
import com.shopflow.entity.User;
import com.shopflow.exception.ResourceNotFoundException;
import com.shopflow.mapper.ProductMapper;
import com.shopflow.repository.CategoryRepository;
import com.shopflow.repository.ProductRepository;
import com.shopflow.repository.UserRepository;
import java.util.ArrayList;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
@Transactional
public class ProductService {

    private final ProductRepository productRepository;
    private final ProductMapper productMapper;
    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;

    public ProductService(ProductRepository productRepository, ProductMapper productMapper,
                          UserRepository userRepository, CategoryRepository categoryRepository) {
        this.productRepository = productRepository;
        this.productMapper = productMapper;
        this.userRepository = userRepository;
        this.categoryRepository = categoryRepository;
    }

    public ProductResponse createProduct(ProductRequest request, Long sellerUserId) {
        Product product = productMapper.toEntity(request);
        User seller = userRepository.findById(sellerUserId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"));
        product.setSeller(seller);

        if (request.categoryIds() != null && !request.categoryIds().isEmpty()) {
            List<Category> categories = categoryRepository.findAllById(request.categoryIds());
            if (categories.size() != request.categoryIds().size()) {
                throw new ResourceNotFoundException("One or more category IDs are invalid");
            }
            product.setCategories(new ArrayList<>(categories));
        }

        return productMapper.toResponse(productRepository.save(product));
    }

    @Transactional(readOnly = true)
    public List<ProductResponse> getAllProducts() {
        return productRepository.findAll()
                .stream()
                .filter(Product::isActif)
                .map(productMapper::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<ProductResponse> getProductsBySellerId(Long sellerId) {
        return productRepository.findBySellerId(sellerId)
                .stream()
                .filter(Product::isActif)
                .map(productMapper::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public ProductResponse getProductById(Long id) {
        return productMapper.toResponse(findProduct(id));
    }

    public ProductResponse updateProduct(Long id, ProductRequest request, Long userId, boolean isAdmin) {
        Product product = findProduct(id);

        if (!isAdmin) {
            if (product.getSeller() == null || !product.getSeller().getId().equals(userId)) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You can only update your own products");
            }
        }

        productMapper.updateEntityFromRequest(request, product);

        if (request.categoryIds() != null) {
            // Empty list clears categories; non-empty list replaces them
            if (request.categoryIds().isEmpty()) {
                product.getCategories().clear();
            } else {
                List<Category> categories = categoryRepository.findAllById(request.categoryIds());
                if (categories.size() != request.categoryIds().size()) {
                    throw new ResourceNotFoundException("One or more category IDs are invalid");
                }
                product.setCategories(new ArrayList<>(categories));
            }
        }
        // categoryIds == null → preserve existing categories unchanged

        return productMapper.toResponse(productRepository.save(product));
    }

    public void deleteProduct(Long id, Long userId, boolean isAdmin) {
        Product product = findProduct(id);

        if (!isAdmin) {
            if (product.getSeller() == null || !product.getSeller().getId().equals(userId)) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You can only delete your own products");
            }
        }

        product.setActif(false);
        productRepository.save(product);
    }

    // ─── Helpers ─────────────────────────────────────────────────────────────

    private Product findProduct(Long id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Product not found with id: " + id));
    }
}
