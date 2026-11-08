package com.example.paymentservice.domain.payment;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, UUID> {
    Optional<Payment> findByTripId(UUID tripId);
    Optional<Payment> findByIdempotencyKey(String idempotencyKey);
    List<Payment> findByCustomerIdOrderByCreatedAtDesc(UUID customerId);
}
