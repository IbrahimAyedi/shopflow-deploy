package com.shopflow.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import java.time.LocalDateTime;

@Entity
@Table(name = "reviews",
        uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "product_id"}))
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString(exclude = {"customer", "product"})
@EqualsAndHashCode(exclude = {"customer", "product"})
public class Review {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Star rating 1–5 */
    @Column(nullable = false)
    private int note;

    @Column(columnDefinition = "TEXT")
    private String commentaire;

    /**
     * Whether a moderator has approved this review for public display.
     * Defaults to false — requires explicit approval.
     */
    @Column(nullable = false)
    @Builder.Default
    private boolean approuve = false;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime dateCreation;

    // ─── Relations ──────────────────────────────────────────────────────────

    /** The customer who wrote the review */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User customer;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;
}
