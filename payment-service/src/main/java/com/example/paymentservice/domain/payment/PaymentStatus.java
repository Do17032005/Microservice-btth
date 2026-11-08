package com.example.paymentservice.domain.payment;

public enum PaymentStatus {
    PENDING,
    SUCCEEDED,
    FAILED,
    REFUND_PENDING,
    REFUNDED,
    PARTIALLY_REFUNDED
}
