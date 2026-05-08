package com.shopflow.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.util.List;

@Data
public class AdminDashboardResponse {

    private BigDecimal totalRevenue;
    private long totalOrders;
    private long totalUsers;
    private long totalProducts;
    private List<OrderResponse> recentOrders;
}
