package com.shopflow.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class UpdateUserActiveRequest {

    @NotNull
    private Boolean active;

    public boolean isActive() {
        return Boolean.TRUE.equals(active);
    }
}