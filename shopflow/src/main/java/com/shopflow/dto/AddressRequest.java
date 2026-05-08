package com.shopflow.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class AddressRequest {
    @NotBlank
    private String rue;
    @NotBlank
    private String ville;
    @NotBlank
    private String codePostal;
    @NotBlank
    private String pays;
    private boolean principal;
}
