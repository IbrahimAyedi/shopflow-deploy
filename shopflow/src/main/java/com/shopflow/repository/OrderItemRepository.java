package com.shopflow.repository;

import com.shopflow.entity.OrderItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {

    List<OrderItem> findByOrderId(Long orderId);

    /**
     * Counts how many delivered order items a user has for a given product.
     * Used by ReviewService to verify the customer actually purchased and received the product.
     */
    @Query("SELECT COUNT(oi) FROM OrderItem oi WHERE oi.order.user.id = :userId AND oi.product.id = :productId AND oi.order.status = 'DELIVERED'")
    long countDeliveredItemsByUserAndProduct(@Param("userId") Long userId, @Param("productId") Long productId);
}
