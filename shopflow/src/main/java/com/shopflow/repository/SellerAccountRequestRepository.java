package com.shopflow.repository;

import com.shopflow.entity.SellerAccountRequest;
import com.shopflow.entity.SellerRequestStatus;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SellerAccountRequestRepository extends JpaRepository<SellerAccountRequest, Long> {
    Optional<SellerAccountRequest> findByEmailIgnoreCase(String email);

    List<SellerAccountRequest> findByStatus(SellerRequestStatus status);

    boolean existsByEmailIgnoreCaseAndStatus(String email, SellerRequestStatus status);
}
