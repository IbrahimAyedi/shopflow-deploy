package com.shopflow.dto;

import com.shopflow.entity.OrderStatus;
import com.shopflow.entity.PaymentMethod;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class OrderResponse {
    private Long id;
    private String numeroCommande;
    private OrderStatus statut;
    private String customerEmail;
    private Long addressId;
    private List<OrderItemResponse> items;
    private BigDecimal sousTotal;
    private BigDecimal remise;
    private BigDecimal fraisLivraison;
    private BigDecimal totalTTC;
    private LocalDateTime dateCommande;
    private PaymentMethod paymentMethod;
}
