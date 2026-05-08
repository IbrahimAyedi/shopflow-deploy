package com.shopflow.config;

import com.shopflow.entity.Coupon;
import com.shopflow.entity.CouponType;
import com.shopflow.entity.Product;
import com.shopflow.entity.Role;
import com.shopflow.entity.SellerProfile;
import com.shopflow.entity.User;
import com.shopflow.repository.CategoryRepository;
import com.shopflow.repository.CouponRepository;
import com.shopflow.repository.ProductRepository;
import com.shopflow.repository.SellerProfileRepository;
import com.shopflow.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;

@Component
@RequiredArgsConstructor
@Slf4j
public class DevDataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;
    private final ProductRepository productRepository;
    private final CouponRepository couponRepository;
    private final SellerProfileRepository sellerProfileRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) {
        log.info("Starting DevDataSeeder...");

        createUserIfNotFound("admin@shopflow.test", "admin@shopflow.test", Role.ADMIN, "ShopFlow Admin", "+216 20 000 001", "/assets/avatars/admin.svg");
        User seller = createUserIfNotFound("seller@shopflow.test", "seller@shopflow.test", Role.SELLER, "ShopFlow Seller", "+216 20 000 002", "/assets/avatars/seller.svg");
        createUserIfNotFound("customer@shopflow.test", "customer@shopflow.test", Role.CUSTOMER, "ShopFlow Customer", "+216 20 000 003", "/assets/avatars/customer.svg");

        com.shopflow.entity.Category electronics = createCategoryIfNotFound(
            "Electronics",
            "Electronic devices, accessories, and tech products."
        );

        createProductIfNotFound("Wireless Mouse", new BigDecimal("49.90"), 25, seller, electronics, "/assets/products/wireless-mouse.svg");
        createProductIfNotFound("Mechanical Keyboard", new BigDecimal("129.90"), 10, seller, electronics, "/assets/products/mechanical-keyboard.svg");
        createProductIfNotFound("USB-C Headphones", new BigDecimal("79.50"), 15, seller, electronics, "/assets/products/usb-c-headphones.svg");

        createCouponIfNotFound("WELCOME10", CouponType.PERCENT, new BigDecimal("10"), 100, LocalDate.of(2030, 12, 31));

        createSellerProfileIfNotFound(seller, "ShopFlow Electronics", "Demo electronics seller for ShopFlow",
                "/assets/products/mechanical-keyboard.svg", 4.8);

        log.info("DevDataSeeder finished.");
    }

    private User createUserIfNotFound(String email, String password, Role role, String fullName, String phone, String avatarUrl) {
        return userRepository.findByEmail(email).orElseGet(() -> {
            User user = User.builder()
                    .email(email)
                    .password(passwordEncoder.encode(password))
                    .role(role)
                    .active(true)
                    .fullName(fullName)
                    .phone(phone)
                    .avatarUrl(avatarUrl)
                    .build();
            log.info("Creating demo user: {}", email);
            return userRepository.save(user);
        });
    }

    private com.shopflow.entity.Category createCategoryIfNotFound(String name, String description) {
        return categoryRepository.findAll().stream()
                .filter(c -> name.equals(c.getNom()))
                .findFirst()
                .orElseGet(() -> {
                    com.shopflow.entity.Category category = com.shopflow.entity.Category.builder()
                            .nom(name)
                            .description(description)
                            .build();
                    log.info("Creating demo category: {}", name);
                    return categoryRepository.save(category);
                });
    }

    private void createProductIfNotFound(String name, BigDecimal price, int quantity, User seller, com.shopflow.entity.Category category, String imageUrl) {
        boolean exists = productRepository.findAll().stream().anyMatch(p -> name.equals(p.getName()));
        if (!exists) {
            Product product = Product.builder()
                    .name(name)
                    .price(price)
                    .quantity(quantity)
                    .seller(seller)
                    .categories(new ArrayList<>(java.util.List.of(category)))
                    .actif(true)
                    .imageUrl(imageUrl)
                    .build();
            log.info("Creating demo product: {}", name);
            productRepository.save(product);
        }
    }

    private void createCouponIfNotFound(String code, CouponType type, BigDecimal value, int maxUsage, LocalDate expiration) {
        if (!couponRepository.existsByCode(code)) {
            Coupon coupon = Coupon.builder()
                    .code(code)
                    .type(type)
                    .valeur(value)
                    .dateExpiration(expiration)
                    .usagesMax(maxUsage)
                    .actif(true)
                    .build();
            log.info("Creating demo coupon: {}", code);
            couponRepository.save(coupon);
        }
    }

    private void createSellerProfileIfNotFound(User seller, String nomBoutique, String description, String logo, double note) {
        if (sellerProfileRepository.findByUserId(seller.getId()).isEmpty()) {
            SellerProfile profile = SellerProfile.builder()
                    .user(seller)
                    .nomBoutique(nomBoutique)
                    .description(description)
                    .logo(logo)
                    .note(note)
                    .build();
            log.info("Creating demo seller profile: {}", nomBoutique);
            sellerProfileRepository.save(profile);
        }
    }
}
