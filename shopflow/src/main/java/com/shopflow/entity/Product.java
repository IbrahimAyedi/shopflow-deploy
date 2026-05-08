package com.shopflow.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "products")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString(exclude = {"categories", "variants", "reviews", "seller"})
@EqualsAndHashCode(exclude = {"categories", "variants", "reviews", "seller"})
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    private BigDecimal price;

    /** Optional promotional price — null when no promotion is active */
    @Column(nullable = true)
    private BigDecimal prixPromo;

    private Integer quantity;

    /** Whether this product is visible/available in the store */
    @Column(nullable = false)
    @Builder.Default
    private boolean actif = true;

    @Column(nullable = true)
    private Double note;

    @Column(nullable = true)
    private String imageUrl;


    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime dateCreation;

    // ─── Relations ──────────────────────────────────────────────────────────

    /** The seller (User with role SELLER) who owns this product */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "seller_id")
    private User seller;

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
            name = "product_category",
            joinColumns = @JoinColumn(name = "product_id"),
            inverseJoinColumns = @JoinColumn(name = "category_id")
    )
    @Builder.Default
    private List<Category> categories = new ArrayList<>();

    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @Builder.Default
    private List<ProductVariant> variants = new ArrayList<>();

    @OneToMany(mappedBy = "product", fetch = FetchType.LAZY)
    @Builder.Default
    private List<Review> reviews = new ArrayList<>();
}
