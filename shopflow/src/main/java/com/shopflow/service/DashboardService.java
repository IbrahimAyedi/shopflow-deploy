package com.shopflow.service;

import com.shopflow.dto.AdminDashboardResponse;
import com.shopflow.dto.OrderResponse;
import com.shopflow.dto.SellerDashboardResponse;
import com.shopflow.mapper.OrderMapper;
import com.shopflow.mapper.ProductMapper;
import com.shopflow.repository.OrderRepository;
import com.shopflow.repository.ProductRepository;
import com.shopflow.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final OrderRepository   orderRepository;
    private final ProductRepository productRepository;
    private final UserRepository    userRepository;
    private final OrderMapper       orderMapper;
    private final ProductMapper     productMapper;

    // ─── Admin Dashboard ─────────────────────────────────────────────────────

    public AdminDashboardResponse getAdminDashboard() {
        BigDecimal totalRevenue = orderRepository.getTotalRevenue();
        if (totalRevenue == null) totalRevenue = BigDecimal.ZERO;

        long totalOrders   = orderRepository.count();
        long totalUsers    = userRepository.count();
        long totalProducts = productRepository.countByActifTrue();

        List<OrderResponse> recentOrders = orderRepository
                .findRecentOrders(PageRequest.of(0, 5))
                .stream()
                .map(orderMapper::toResponse)
                .collect(Collectors.toList());

        AdminDashboardResponse response = new AdminDashboardResponse();
        response.setTotalRevenue(totalRevenue);
        response.setTotalOrders(totalOrders);
        response.setTotalUsers(totalUsers);
        response.setTotalProducts(totalProducts);
        response.setRecentOrders(recentOrders);
        return response;
    }

    // ─── Seller Dashboard ─────────────────────────────────────────────────────

    public SellerDashboardResponse getSellerDashboard(Long userId) {
        BigDecimal sellerRevenue = orderRepository.getSellerRevenue(userId);
        if (sellerRevenue == null) sellerRevenue = BigDecimal.ZERO;

        long pendingOrders = orderRepository.countPendingOrdersBySellerId(userId);

        // Products with quantity < 5 are considered low stock
        var lowStockProducts = productRepository.findBySellerIdAndQuantityLessThan(userId, 5)
                .stream()
                .map(productMapper::toResponse)
                .collect(Collectors.toList());

        SellerDashboardResponse response = new SellerDashboardResponse();
        response.setSellerRevenue(sellerRevenue);
        response.setPendingOrders(pendingOrders);
        response.setLowStockProducts(lowStockProducts);
        return response;
    }
}
