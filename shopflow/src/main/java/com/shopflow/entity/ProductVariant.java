package com.shopflow.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "product_variants")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString(exclude = "product")
@EqualsAndHashCode(exclude = "product")
public class ProductVariant {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Attribute name, e.g. "Color", "Size" */
    @Column(nullable = false)
    private String attribut;

    /** Attribute value, e.g. "Red", "XL" */
    @Column(nullable = false)
    private String valeur;

    /** Extra stock available for this specific variant */
    @Column(nullable = false)
    @Builder.Default
    private int stockSupplementaire = 0;

    /**
     * Price delta applied on top of the base product price.
     * Can be negative (discount) or positive (surcharge).
     */
    private Double prixDelta;

    // ─── Relations ──────────────────────────────────────────────────────────

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;
}
