package com.shopflow.dto;

import lombok.Data;

@Data
public class AddressResponse {
    private Long id;
    private String rue;
    private String ville;
    private String codePostal;
    private String pays;
    private boolean principal;
}
