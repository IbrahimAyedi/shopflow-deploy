package com.shopflow.dto;

import lombok.Data;

@Data
public class SellerProfileResponse {
    private Long id;
    private String nomBoutique;
    private String description;
    private String logo;
    private Double note;
    private Long userId;
}
