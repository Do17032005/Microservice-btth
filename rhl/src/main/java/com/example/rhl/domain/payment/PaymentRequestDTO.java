package com.example.rhl.domain.payment;

import lombok.Data;

@Data
public class PaymentRequestDTO {
    private PaymentMethod method = PaymentMethod.E_WALLET_SANDBOX;
}
