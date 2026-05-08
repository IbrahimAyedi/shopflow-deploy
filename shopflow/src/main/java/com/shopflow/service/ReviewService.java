package com.shopflow.service;

import com.shopflow.dto.ReviewRequest;
import com.shopflow.dto.ReviewResponse;
import com.shopflow.entity.Product;
import com.shopflow.entity.Review;
import com.shopflow.entity.User;
import com.shopflow.exception.BusinessException;
import com.shopflow.exception.ResourceNotFoundException;
import com.shopflow.mapper.ReviewMapper;
import com.shopflow.repository.OrderItemRepository;
import com.shopflow.repository.ProductRepository;
import com.shopflow.repository.ReviewRepository;
import com.shopflow.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReviewService {

    private final ReviewRepository    reviewRepository;
    private final ProductRepository   productRepository;
    private final UserRepository      userRepository;
    private final OrderItemRepository orderItemRepository;
    private final ReviewMapper        reviewMapper;

    // ─── Add Review ──────────────────────────────────────────────────────────

    @Transactional
    public ReviewResponse addReview(Long userId, ReviewRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userId));

        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException("Product not found: " + request.getProductId()));

        // Verify the customer has a DELIVERED order containing this product
        long count = orderItemRepository.countDeliveredItemsByUserAndProduct(userId, request.getProductId());
        if (count == 0) {
            throw new BusinessException("You can only review products from your delivered orders.");
        }

        // Prevent duplicate reviews
        if (reviewRepository.existsByCustomerIdAndProductId(userId, request.getProductId())) {
            throw new BusinessException("Already reviewed");
        }

        Review review = Review.builder()
                .customer(user)
                .product(product)
                .note(request.getNote())
                .commentaire(request.getCommentaire())
                .approuve(false)
                .build();

        return reviewMapper.toResponse(reviewRepository.save(review));
    }

    // ─── Get Product Reviews (approved only) ─────────────────────────────────

    public List<ReviewResponse> getProductReviews(Long productId) {
        return reviewRepository.findByProductIdAndApprouveTrue(productId)
                .stream()
                .map(reviewMapper::toResponse)
                .collect(Collectors.toList());
    }

    // ─── Get Pending Reviews (Admin only) ────────────────────────────────────

    public List<ReviewResponse> getPendingReviews() {
        return reviewRepository.findByApprouveFalse().stream()
                .map(reviewMapper::toResponse)
                .collect(Collectors.toList());
    }

    // ─── Approve Review ──────────────────────────────────────────────────────

    @Transactional
    public ReviewResponse approveReview(Long reviewId) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new ResourceNotFoundException("Review not found: " + reviewId));

        review.setApprouve(true);
        reviewRepository.save(review);

        // Recalculate product.note as average of all approved reviews
        Product product = review.getProduct();
        List<Review> approvedReviews = reviewRepository.findByProductIdAndApprouveTrue(product.getId());

        if (!approvedReviews.isEmpty()) {
            double avg = approvedReviews.stream()
                    .mapToInt(Review::getNote)
                    .average()
                    .orElse(0.0);
            // Round to one decimal place
            product.setNote(Math.round(avg * 10.0) / 10.0);
        } else {
            product.setNote(null);
        }
        productRepository.save(product);

        return reviewMapper.toResponse(review);
    }

    // ─── Delete Review ───────────────────────────────────────────────────────

    @Transactional
    public void deleteReview(Long reviewId) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new ResourceNotFoundException("Review not found: " + reviewId));

        boolean wasApproved = review.isApprouve();
        Product product = review.getProduct();

        reviewRepository.delete(review);
        reviewRepository.flush();

        // Recalculate product.note only when an approved review is removed
        if (wasApproved) {
                List<Review> remaining = reviewRepository.findByProductIdAndApprouveTrue(product.getId());

            if (remaining.isEmpty()) {
                product.setNote(null);
            } else {
                double avg = remaining.stream()
                        .mapToInt(Review::getNote)
                        .average()
                        .orElse(0.0);
                product.setNote(Math.round(avg * 10.0) / 10.0);
            }
            productRepository.save(product);
        }
    }
}
