package com.shopflow.service;

import com.shopflow.dto.CartItemRequest;
import com.shopflow.dto.CartItemResponse;
import com.shopflow.dto.CartResponse;
import com.shopflow.entity.*;
import com.shopflow.exception.BusinessException;
import com.shopflow.exception.ResourceNotFoundException;
import com.shopflow.exception.StockException;
import com.shopflow.mapper.CartMapper;
import com.shopflow.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CartService {

    private final CartRepository     cartRepository;
    private final CartItemRepository cartItemRepository;
    private final ProductRepository  productRepository;
    private final ProductVariantRepository productVariantRepository;
    private final UserRepository     userRepository;
    private final CouponRepository   couponRepository;
    private final CartMapper         cartMapper;

    // ─── Get or Create ───────────────────────────────────────────────────────

    @Transactional
    public CartResponse getOrCreateCart(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userId));

        Cart cart = cartRepository.findByUserId(userId)
                .orElseGet(() -> {
                    Cart newCart = Cart.builder().user(user).build();
                    return cartRepository.save(newCart);
                });

        return buildCartResponse(cart);
    }

    // ─── Add Item ────────────────────────────────────────────────────────────

    @Transactional
    public CartResponse addItem(Long userId, CartItemRequest request) {
        Cart cart = getOrCreateCartEntity(userId);

        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException("Product not found: " + request.getProductId()));

        ProductVariant variant = null;
        if (request.getVariantId() != null) {
            variant = productVariantRepository.findById(request.getVariantId())
                    .orElseThrow(() -> new ResourceNotFoundException("Variant not found: " + request.getVariantId()));
        }

        // Stock check
        int currentStock = product.getQuantity();
        if (currentStock < request.getQuantite()) {
            throw new StockException("Insufficient stock for product '" + product.getName()
                    + "'. Available: " + currentStock + ", requested: " + request.getQuantite());
        }

        // If same (product + variant) item already in cart, increment quantity
        final ProductVariant finalVariant = variant;
        Optional<CartItem> existingItem = cart.getItems().stream()
                .filter(ci -> ci.getProduct().getId().equals(product.getId())
                        && ((finalVariant == null && ci.getVariant() == null)
                            || (finalVariant != null && ci.getVariant() != null
                                && ci.getVariant().getId().equals(finalVariant.getId()))))
                .findFirst();

        if (existingItem.isPresent()) {
            CartItem item = existingItem.get();
            int newQty = item.getQuantite() + request.getQuantite();
            if (newQty > currentStock) {
                throw new StockException("Insufficient stock for product '" + product.getName()
                        + "'. Available: " + currentStock + ", total requested: " + newQty);
            }
            item.setQuantite(newQty);
            cartItemRepository.save(item);
        } else {
            CartItem newItem = CartItem.builder()
                    .cart(cart)
                    .product(product)
                    .variant(finalVariant)
                    .quantite(request.getQuantite())
                    .build();
            cart.getItems().add(newItem);
            cartItemRepository.save(newItem);
        }

        cartRepository.save(cart); // triggers @UpdateTimestamp on dateModification
        return buildCartResponse(cart);
    }

    // ─── Update Item Quantity ────────────────────────────────────────────────

    @Transactional
    public CartResponse updateItemQuantity(Long userId, Long cartItemId, int newQuantity) {
        Cart cart = getOrCreateCartEntity(userId);

        CartItem item = cartItemRepository.findById(cartItemId)
                .orElseThrow(() -> new ResourceNotFoundException("Cart item not found: " + cartItemId));

        verifyItemOwnership(cart, item);

        if (newQuantity == 0) {
            cart.getItems().remove(item);
            cartItemRepository.delete(item);
        } else {
            int stock = item.getProduct().getQuantity();
            if (newQuantity > stock) {
                throw new StockException("Insufficient stock for product '" + item.getProduct().getName()
                        + "'. Available: " + stock + ", requested: " + newQuantity);
            }
            item.setQuantite(newQuantity);
            cartItemRepository.save(item);
        }

        cartRepository.save(cart);
        return buildCartResponse(cart);
    }

    // ─── Remove Item ─────────────────────────────────────────────────────────

    @Transactional
    public CartResponse removeItem(Long userId, Long cartItemId) {
        Cart cart = getOrCreateCartEntity(userId);

        CartItem item = cartItemRepository.findById(cartItemId)
                .orElseThrow(() -> new ResourceNotFoundException("Cart item not found: " + cartItemId));

        verifyItemOwnership(cart, item);

        cart.getItems().remove(item);
        cartItemRepository.delete(item);
        cartRepository.save(cart);
        return buildCartResponse(cart);
    }

    // ─── Apply Coupon ─────────────────────────────────────────────────────────

    @Transactional
    public CartResponse applyCoupon(Long userId, String code) {
        Cart cart = getOrCreateCartEntity(userId);

        Coupon coupon = couponRepository.findByCode(code)
                .orElseThrow(() -> new BusinessException("Coupon not found: " + code));

        if (!coupon.isActif()) {
            throw new BusinessException("Coupon '" + code + "' is not active.");
        }
        if (coupon.getDateExpiration() != null && coupon.getDateExpiration().isBefore(LocalDate.now())) {
            throw new BusinessException("Coupon '" + code + "' has expired.");
        }
        if (coupon.getUsagesMax() > 0 && coupon.getUsagesActuels() >= coupon.getUsagesMax()) {
            throw new BusinessException("Coupon '" + code + "' has reached its maximum usage limit.");
        }

        cart.setAppliedCoupon(coupon);
        cartRepository.save(cart);
        return buildCartResponse(cart);
    }

    // ─── Remove Coupon ───────────────────────────────────────────────────────

    @Transactional
    public CartResponse removeCoupon(Long userId) {
        Cart cart = getOrCreateCartEntity(userId);
        cart.setAppliedCoupon(null);
        cartRepository.save(cart);
        return buildCartResponse(cart);
    }

    // ─── Private Helpers ─────────────────────────────────────────────────────

    private Cart getOrCreateCartEntity(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userId));
        return cartRepository.findByUserId(userId)
                .orElseGet(() -> cartRepository.save(Cart.builder().user(user).build()));
    }

    private void verifyItemOwnership(Cart cart, CartItem item) {
        if (!item.getCart().getId().equals(cart.getId())) {
            throw new BusinessException("Cart item " + item.getId() + " does not belong to this cart.");
        }
    }

    /**
     * Builds the full CartResponse, mapping each item and computing totals.
     * sousTotal = Σ(product.price × quantite)
     * remise    = coupon discount (PERCENT or FIXED, min 0)
     * fraisLivraison = 7.0 if sousTotal < 50, else 0
     * totalTTC  = sousTotal − remise + fraisLivraison
     */
    private CartResponse buildCartResponse(Cart cart) {
        List<CartItemResponse> itemResponses = cart.getItems().stream()
                .map(ci -> {
                    CartItemResponse r = cartMapper.toItemResponse(ci);
                    BigDecimal prix = ci.getProduct().getPrice();
                    BigDecimal sous = prix.multiply(BigDecimal.valueOf(ci.getQuantite()));
                    r.setPrixUnitaire(prix);
                    r.setSousTotal(sous);
                    return r;
                })
                .collect(Collectors.toList());

        BigDecimal sousTotal = itemResponses.stream()
                .map(CartItemResponse::getSousTotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal remise = BigDecimal.ZERO;
        String couponCode = null;

        Coupon coupon = cart.getAppliedCoupon();
        if (coupon != null) {
            couponCode = coupon.getCode();
            if (coupon.getType() == CouponType.PERCENT) {
                remise = sousTotal.multiply(coupon.getValeur())
                                  .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
            } else { // FIXED
                remise = coupon.getValeur();
            }
            // Remise cannot exceed sousTotal
            if (remise.compareTo(sousTotal) > 0) {
                remise = sousTotal;
            }
        }

        BigDecimal fraisLivraison = sousTotal.compareTo(BigDecimal.valueOf(50)) < 0
                ? BigDecimal.valueOf(7.0)
                : BigDecimal.ZERO;

        BigDecimal totalTTC = sousTotal.subtract(remise).add(fraisLivraison);

        CartResponse response = new CartResponse();
        response.setId(cart.getId());
        response.setItems(itemResponses);
        response.setCouponCode(couponCode);
        response.setSousTotal(sousTotal);
        response.setRemise(remise);
        response.setFraisLivraison(fraisLivraison);
        response.setTotalTTC(totalTTC);
        return response;
    }
}
