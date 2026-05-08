package com.shopflow.controller;

import com.shopflow.dto.SellerAccountRequestCreateRequest;
import com.shopflow.dto.SellerAccountRequestResponse;
import com.shopflow.service.SellerAccountRequestService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/seller-requests")
public class SellerAccountRequestController {

    private final SellerAccountRequestService sellerAccountRequestService;

    @PostMapping
    public ResponseEntity<SellerAccountRequestResponse> createRequest(
            @Valid @RequestBody SellerAccountRequestCreateRequest request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED).body(sellerAccountRequestService.createRequest(request));
    }
}
