package com.shopflow.controller;

import com.shopflow.dto.SellerAccountRequestDecisionRequest;
import com.shopflow.dto.SellerAccountRequestResponse;
import com.shopflow.service.SellerAccountRequestService;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/admin/seller-requests")
@PreAuthorize("hasRole('ADMIN')")
public class AdminSellerAccountRequestController {

    private final SellerAccountRequestService sellerAccountRequestService;

    @GetMapping
    public ResponseEntity<List<SellerAccountRequestResponse>> getRequests() {
        return ResponseEntity.ok(sellerAccountRequestService.listRequests());
    }

    @GetMapping("/pending")
    public ResponseEntity<List<SellerAccountRequestResponse>> getPendingRequests() {
        return ResponseEntity.ok(sellerAccountRequestService.listPendingRequests());
    }

    @PatchMapping("/{id}/approve")
    public ResponseEntity<SellerAccountRequestResponse> approveRequest(
            @PathVariable Long id,
            @RequestBody(required = false) SellerAccountRequestDecisionRequest request
    ) {
        return ResponseEntity.ok(sellerAccountRequestService.approveRequest(id, request));
    }

    @PatchMapping("/{id}/reject")
    public ResponseEntity<SellerAccountRequestResponse> rejectRequest(
            @PathVariable Long id,
            @RequestBody(required = false) SellerAccountRequestDecisionRequest request
    ) {
        return ResponseEntity.ok(sellerAccountRequestService.rejectRequest(id, request));
    }
}
