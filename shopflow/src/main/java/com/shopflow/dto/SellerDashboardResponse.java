package com.shopflow.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.util.List;

@Data
public class SellerDashboardResponse {

    private BigDecimal sellerRevenue;
    private long pendingOrders;
    private List<ProductResponse> lowStockProducts;
}
