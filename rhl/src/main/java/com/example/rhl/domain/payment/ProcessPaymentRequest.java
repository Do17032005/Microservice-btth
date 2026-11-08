package com.example.rhl.domain.payment;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProcessPaymentRequest {
    private UUID tripId;
    private UUID customerId;
    private UUID driverId;
    private BigDecimal amount;
    private String currency;
    private PaymentMethod method;
}
