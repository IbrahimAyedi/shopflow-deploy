package com.shopflow.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class ReviewResponse {

    private Long id;
    private Long userId;
    private Long productId;
    private String customerEmail;
    private String customerName;
    private int note;
    private String commentaire;
    private boolean approuve;
    private LocalDateTime dateCreation;
}
