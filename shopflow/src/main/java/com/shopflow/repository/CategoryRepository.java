package com.shopflow.repository;

import com.shopflow.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface CategoryRepository extends JpaRepository<Category, Long> {

    /** Returns only top-level categories (those without a parent) */
    List<Category> findByParentIsNull();
}
