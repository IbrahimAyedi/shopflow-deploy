package com.shopflow.repository;

import com.shopflow.entity.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {

    List<Review> findByProductId(Long productId);

    List<Review> findByProductIdAndApprouveTrue(Long productId);

    /** Used to prevent duplicate reviews: returns true if user already reviewed this product */
    boolean existsByCustomerIdAndProductId(Long userId, Long productId);

    /** Used by admin pending-reviews list — avoids full table scan + in-memory filter */
    List<Review> findByApprouveFalse();
}
