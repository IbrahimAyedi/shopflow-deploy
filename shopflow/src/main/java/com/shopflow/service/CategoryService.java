package com.shopflow.service;

import com.shopflow.dto.CategoryRequest;
import com.shopflow.dto.CategoryResponse;
import com.shopflow.entity.Category;
import com.shopflow.exception.BusinessException;
import com.shopflow.exception.ResourceNotFoundException;
import com.shopflow.mapper.CategoryMapper;
import com.shopflow.repository.CategoryRepository;
import com.shopflow.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CategoryService {

    private final CategoryRepository categoryRepository;
    private final ProductRepository  productRepository;
    private final CategoryMapper      categoryMapper;

    // ─── Create ─────────────────────────────────────────────────────────────

    @Transactional
    public CategoryResponse createCategory(CategoryRequest request) {
        Category category = new Category();
        category.setNom(request.getNom());
        category.setDescription(request.getDescription());

        if (request.getParentId() != null) {
            Category parent = categoryRepository.findById(request.getParentId())
                    .orElseThrow(() -> new ResourceNotFoundException("Parent category not found: " + request.getParentId()));
            category.setParent(parent);
        }

        return categoryMapper.toResponse(categoryRepository.save(category));
    }

    // ─── Read ────────────────────────────────────────────────────────────────

    /** Returns a flat list of ALL categories (root and children alike). */
    @Transactional(readOnly = true)
    public List<CategoryResponse> getAllCategories() {
        return categoryRepository.findAll()
                .stream()
                .map(categoryMapper::toResponse)
                .collect(Collectors.toList());
    }

    /**
     * Returns only root categories (parent == null).
     * Their children are already loaded via the OneToMany relation and
     * mapped recursively by MapStruct if children is mapped.
     * Because children is also a List<CategoryResponse> in the DTO,
     * we map root categories and ignore the children list at this level
     * (children are loaded lazily — the service is called within a transaction if needed).
     */
    @Transactional(readOnly = true)
    public List<CategoryResponse> getCategoryTree() {
        return categoryRepository.findByParentIsNull()
                .stream()
                .map(categoryMapper::toResponse)
                .collect(Collectors.toList());
    }

    // ─── Update ──────────────────────────────────────────────────────────────

    @Transactional
    public CategoryResponse updateCategory(Long id, CategoryRequest request) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found: " + id));

        category.setNom(request.getNom());
        category.setDescription(request.getDescription());

        if (request.getParentId() != null) {
            Category parent = categoryRepository.findById(request.getParentId())
                    .orElseThrow(() -> new ResourceNotFoundException("Parent category not found: " + request.getParentId()));
            category.setParent(parent);
        } else {
            category.setParent(null);
        }

        return categoryMapper.toResponse(categoryRepository.save(category));
    }

    // ─── Delete ──────────────────────────────────────────────────────────────

    @Transactional
    public void deleteCategory(Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found: " + id));

        boolean hasProducts = !category.getChildren().isEmpty()
                || productRepository.findAll().stream()
                       .anyMatch(p -> p.getCategories().stream()
                               .anyMatch(c -> c.getId().equals(id)));

        if (hasProducts) {
            throw new BusinessException("Cannot delete category " + id + " because products are linked to it.");
        }

        categoryRepository.delete(category);
    }
}
