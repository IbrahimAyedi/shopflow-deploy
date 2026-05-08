package com.shopflow.repository;

import com.shopflow.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {

    /** Used by DashboardService — count active products in the catalogue */
    long countByActifTrue();

    /** Used by SellerDashboardService — find seller's low-stock products */
    List<Product> findBySellerIdAndQuantityLessThan(Long sellerId, int threshold);

    /** Used by ProductService to isolate seller products */
    List<Product> findBySellerId(Long sellerId);
}
