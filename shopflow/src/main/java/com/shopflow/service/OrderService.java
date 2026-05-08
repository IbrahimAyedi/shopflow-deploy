package com.shopflow.service;

import com.shopflow.dto.OrderResponse;
import com.shopflow.dto.PlaceOrderRequest;
import com.shopflow.entity.*;
import com.shopflow.exception.BusinessException;
import com.shopflow.exception.ResourceNotFoundException;
import com.shopflow.exception.StockException;
import com.shopflow.mapper.OrderMapper;
import com.shopflow.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Year;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository   orderRepository;
    private final CartRepository    cartRepository;
    private final AddressRepository addressRepository;
    private final ProductRepository productRepository;
    private final CouponRepository  couponRepository;
    private final UserRepository    userRepository;
    private final OrderMapper       orderMapper;

    // ─── Place Order ─────────────────────────────────────────────────────────

    @Transactional
    public OrderResponse placeOrder(Long userId, PlaceOrderRequest request) {

        // 1. Load cart and verify it is not empty
        Cart cart = cartRepository.findByUserId(userId)
                .orElseThrow(() -> new BusinessException("Cart is empty"));

        List<CartItem> cartItems = cart.getItems();
        if (cartItems.isEmpty()) {
            throw new BusinessException("Cart is empty");
        }

        // 2. Load and verify address ownership
        Address address = addressRepository.findById(request.getAddressId())
                .orElseThrow(() -> new ResourceNotFoundException("Address not found: " + request.getAddressId()));

        if (!address.getUser().getId().equals(userId)) {
            throw new BusinessException("Address " + request.getAddressId()
                    + " does not belong to user " + userId);
        }

        // 3. Load user
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userId));

        // 4. Per-item: stock check then decrement
        for (CartItem ci : cartItems) {
            Product product = ci.getProduct();
            int available = product.getQuantity();
            if (ci.getQuantite() > available) {
                throw new StockException("Insufficient stock for product '" + product.getName()
                        + "'. Available: " + available + ", ordered: " + ci.getQuantite());
            }
            product.setQuantity(available - ci.getQuantite());
            productRepository.save(product);

            // Decrement variant supplementary stock if a variant was chosen
            if (ci.getVariant() != null) {
                ProductVariant variant = ci.getVariant();
                variant.setStockSupplementaire(Math.max(0, variant.getStockSupplementaire() - ci.getQuantite()));
            }
        }

        // 5. Build unique order number
        String numeroCommande = "ORD-" + Year.now().getValue() + "-"
                + UUID.randomUUID().toString().substring(0, 8).toUpperCase();

        // 6. Compute sousTotal
        BigDecimal sousTotal = cartItems.stream()
                .map(ci -> ci.getProduct().getPrice().multiply(BigDecimal.valueOf(ci.getQuantite())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal fraisLivraison = sousTotal.compareTo(BigDecimal.valueOf(50)) >= 0
                ? BigDecimal.ZERO
                : BigDecimal.valueOf(7.0);

        // 7. Apply coupon discount
        BigDecimal remise = BigDecimal.ZERO;
        Coupon coupon = cart.getAppliedCoupon();
        if (coupon != null) {
            if (coupon.getType() == CouponType.PERCENT) {
                remise = sousTotal.multiply(coupon.getValeur())
                        .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
            } else { // FIXED
                remise = coupon.getValeur();
            }
            if (remise.compareTo(sousTotal) > 0) {
                remise = sousTotal;
            }
            coupon.setUsagesActuels(coupon.getUsagesActuels() + 1);
            couponRepository.save(coupon);
        }

        BigDecimal totalTTC = sousTotal.subtract(remise).add(fraisLivraison);

        // 8. Create Order entity
        Order order = Order.builder()
                .numeroCommande(numeroCommande)
                .status(OrderStatus.PENDING)
                .user(user)
                .deliveryAddress(address)
                .coupon(coupon)
                .sousTotal(sousTotal)
                .remise(remise)
                .fraisLivraison(fraisLivraison)
                .totalTTC(totalTTC)
                .build();

        // 9. Create OrderItem price snapshots
        List<OrderItem> orderItems = cartItems.stream()
                .map(ci -> OrderItem.builder()
                        .order(order)
                        .product(ci.getProduct())
                        .variant(ci.getVariant())
                        .quantite(ci.getQuantite())
                        .prixUnitaire(ci.getProduct().getPrice()) // snapshot at time of purchase
                        .build())
                .collect(Collectors.toList());

        order.getItems().addAll(orderItems);

        // 10. Clear cart (orphanRemoval deletes all CartItems)
        cart.getItems().clear();
        cart.setAppliedCoupon(null);
        cartRepository.save(cart);

        return orderMapper.toResponse(orderRepository.save(order));
    }

    // ─── Get Order by ID ─────────────────────────────────────────────────────

    /**
     * Returns an order and verifies it belongs to the user.
     * ADMIN bypass: call orderRepository.findById directly in the controller.
     */
    public OrderResponse getOrderById(Long orderId, Long userId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found: " + orderId));

        if (!order.getUser().getId().equals(userId)) {
            throw new BusinessException("Order " + orderId + " does not belong to user " + userId);
        }

        return orderMapper.toResponse(order);
    }

    // ─── My Orders (paginated) ───────────────────────────────────────────────

    public Page<OrderResponse> getMyOrders(Long userId, Pageable pageable) {
        return orderRepository.findByUserId(userId, pageable)
                .map(orderMapper::toResponse);
    }

    // ─── All Orders — ADMIN only (enforced in controller) ───────────────────

    public Page<OrderResponse> getAllOrders(Pageable pageable) {
        return orderRepository.findAll(pageable)
                .map(orderMapper::toResponse);
    }

    // ─── Seller Orders (paginated) ───────────────────────────────────────────────

    public Page<OrderResponse> getSellerOrders(Long sellerId, Pageable pageable) {
        return orderRepository.findBySellerId(sellerId, pageable)
                .map(orderMapper::toResponse);
    }

    // ─── Update Status ───────────────────────────────────────────────────────

    @Transactional
    public OrderResponse updateOrderStatus(Long orderId, OrderStatus newStatus, Long userId, boolean isAdmin) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found: " + orderId));

        if (!isAdmin) {
            boolean hasSellerProduct = order.getItems().stream()
                    .anyMatch(item -> item.getProduct().getSeller() != null && 
                                      item.getProduct().getSeller().getId().equals(userId));
            if (!hasSellerProduct) {
                throw new BusinessException("You are not authorized to update this order.");
            }
        }

        order.setStatus(newStatus);
        return orderMapper.toResponse(orderRepository.save(order));
    }

    // ─── Cancel Order ────────────────────────────────────────────────────────

    @Transactional
    public OrderResponse cancelOrder(Long orderId, Long userId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found: " + orderId));

        if (!order.getUser().getId().equals(userId)) {
            throw new BusinessException("Order " + orderId + " does not belong to user " + userId);
        }

        OrderStatus current = order.getStatus();
        if (current != OrderStatus.PENDING && current != OrderStatus.PAID) {
            throw new BusinessException("Order " + orderId
                    + " cannot be cancelled in status: " + current);
        }

        // Restore stock per order item
        for (OrderItem item : order.getItems()) {
            Product product = item.getProduct();
            product.setQuantity(product.getQuantity() + item.getQuantite());
            productRepository.save(product);

            if (item.getVariant() != null) {
                ProductVariant variant = item.getVariant();
                variant.setStockSupplementaire(variant.getStockSupplementaire() + item.getQuantite());
            }
        }

        // PAID → REFUNDED, PENDING → CANCELLED
        order.setStatus(current == OrderStatus.PAID ? OrderStatus.REFUNDED : OrderStatus.CANCELLED);
        return orderMapper.toResponse(orderRepository.save(order));
    }

    // ─── Accept Order (Seller) ──────────────────────────────────────────────

    @Transactional
    public OrderResponse acceptOrder(Long orderId, Long sellerId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found: " + orderId));

        boolean hasSellerProduct = order.getItems().stream()
                .anyMatch(item -> item.getProduct().getSeller() != null &&
                                  item.getProduct().getSeller().getId().equals(sellerId));
        if (!hasSellerProduct) {
            throw new BusinessException("You are not authorized to accept this order.");
        }

        if (order.getStatus() != OrderStatus.PENDING) {
            throw new BusinessException("Order can only be accepted when PENDING. Current: " + order.getStatus());
        }

        order.setStatus(OrderStatus.PROCESSING);
        return orderMapper.toResponse(orderRepository.save(order));
    }

    // ─── Reject Order (Seller) ──────────────────────────────────────────────

    @Transactional
    public OrderResponse rejectOrder(Long orderId, Long sellerId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found: " + orderId));

        boolean hasSellerProduct = order.getItems().stream()
                .anyMatch(item -> item.getProduct().getSeller() != null &&
                                  item.getProduct().getSeller().getId().equals(sellerId));
        if (!hasSellerProduct) {
            throw new BusinessException("You are not authorized to reject this order.");
        }

        if (order.getStatus() != OrderStatus.PENDING) {
            throw new BusinessException("Order can only be rejected when PENDING. Current: " + order.getStatus());
        }

        // Restore stock
        for (OrderItem item : order.getItems()) {
            Product product = item.getProduct();
            product.setQuantity(product.getQuantity() + item.getQuantite());
            productRepository.save(product);
        }

        order.setStatus(OrderStatus.CANCELLED);
        return orderMapper.toResponse(orderRepository.save(order));
    }

    // ─── Select Payment Method (Customer) ───────────────────────────────────

    @Transactional
    public OrderResponse selectPaymentMethod(Long orderId, Long userId, com.shopflow.entity.PaymentMethod paymentMethod) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found: " + orderId));

        if (!order.getUser().getId().equals(userId)) {
            throw new BusinessException("Order " + orderId + " does not belong to user " + userId);
        }

        if (order.getStatus() == OrderStatus.CANCELLED || order.getStatus() == OrderStatus.REFUNDED) {
            throw new BusinessException("Cannot set payment method for cancelled/refunded order.");
        }

        order.setPaymentMethod(paymentMethod);
        return orderMapper.toResponse(orderRepository.save(order));
    }
}
