package com.shopflow.dto;

import com.shopflow.entity.PaymentMethod;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class SelectPaymentMethodRequest {

    @NotNull
    private PaymentMethod paymentMethod;
}
