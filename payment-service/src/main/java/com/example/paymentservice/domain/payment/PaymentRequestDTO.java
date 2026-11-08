package com.example.paymentservice.domain.payment;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
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
public class PaymentRequestDTO {

    @NotNull(message = "Trip ID is required")
    private UUID tripId;

    @NotNull(message = "Customer ID is required")
    private UUID customerId;

    @NotNull(message = "Driver ID is required")
    private UUID driverId;

    @NotNull(message = "Amount is required")
    @Positive(message = "Amount must be positive")
    private BigDecimal amount;

    private String currency = "VND";

    private PaymentMethod method = PaymentMethod.E_WALLET_SANDBOX;
}
