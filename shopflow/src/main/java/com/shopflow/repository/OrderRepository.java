package com.shopflow.repository;

import com.shopflow.entity.Order;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {

    /** Returns all orders for a user, paginated (sort handled by caller) */
    Page<Order> findByUserId(Long userId, Pageable pageable);

    @Query("SELECT DISTINCT o FROM Order o JOIN o.items i WHERE i.product.seller.id = :sellerId ORDER BY o.dateCommande DESC")
    Page<Order> findBySellerId(Long sellerId, Pageable pageable);

    Optional<Order> findByNumeroCommande(String numeroCommande);

    // ─── Dashboard queries ───────────────────────────────────────────────────

    /** Total revenue from all non-cancelled orders */
    @Query("SELECT SUM(o.totalTTC) FROM Order o WHERE o.status <> 'CANCELLED'")
    BigDecimal getTotalRevenue();

    /** Most recent orders — use with PageRequest.of(0, N) */
    @Query("SELECT o FROM Order o ORDER BY o.dateCommande DESC")
    List<Order> findRecentOrders(Pageable pageable);

    /** Count orders for a seller — orders containing at least one item from that seller */
    @Query("SELECT COUNT(DISTINCT o) FROM Order o JOIN o.items i WHERE i.product.seller.id = :sellerId AND o.status = 'PENDING'")
    long countPendingOrdersBySellerId(Long sellerId);

    /** Sum of totalTTC for orders that contain at least one product from a given seller */
    @Query("SELECT COALESCE(SUM(DISTINCT o.totalTTC), 0) FROM Order o JOIN o.items i WHERE i.product.seller.id = :sellerId AND o.status <> 'CANCELLED'")
    BigDecimal getSellerRevenue(Long sellerId);
}
