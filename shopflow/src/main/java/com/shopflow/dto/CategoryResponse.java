package com.shopflow.dto;

import lombok.Data;
import java.util.List;

@Data
public class CategoryResponse {
    private Long id;
    private String nom;
    private String description;
    /** Null for root categories */
    private Long parentId;
    /** Populated only in tree view */
    private List<CategoryResponse> children;
}
