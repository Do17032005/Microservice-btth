package com.example.rhl.domain.trip;

import com.example.rhl.domain.payment.PaymentMethod;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateTripRequestDTO {

    @NotNull(message = "Quote ID is required")
    private UUID quoteId;

    @NotNull(message = "Customer ID is required")
    private UUID customerId;

    @Builder.Default
    private PaymentMethod paymentMethod = PaymentMethod.E_WALLET_SANDBOX;

    // Delivery fields (optional)
    private String receiverName;
    private String receiverPhone;
    private String packageDescription;
}
