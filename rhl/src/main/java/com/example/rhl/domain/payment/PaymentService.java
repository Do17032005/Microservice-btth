package com.example.rhl.domain.payment;

import com.example.rhl.common.ApiException;
import com.example.rhl.domain.trip.Trip;
import com.example.rhl.domain.trip.TripRepository;
import com.example.rhl.domain.trip.TripStatus;
import com.example.rhl.domain.wallet.WalletService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final TripRepository tripRepository;
    private final WalletService walletService;

    // Default platform commission: 20% (FR-WAL-004)
    private static final BigDecimal PLATFORM_COMMISSION_RATE = BigDecimal.valueOf(0.20);

    @Transactional
    public PaymentDTO processTripPayment(UUID tripId, PaymentMethod method, String idempotencyKey) {
        Trip trip = tripRepository.findById(tripId)
                .orElseThrow(() -> ApiException.notFound("TRIP_NOT_FOUND", "Trip not found: " + tripId));

        if (trip.getStatus() != TripStatus.COMPLETED) {
            throw ApiException.badRequest("TRIP_NOT_COMPLETED", "Cannot settle payment for uncompleted trip: " + trip.getStatus());
        }

        // FR-PAY-003: Idempotency by trip or idempotencyKey
        Optional<Payment> existing = paymentRepository.findByTripId(tripId);
        if (existing.isPresent() && existing.get().getStatus() == PaymentStatus.SUCCEEDED) {
            log.info("Payment already completed for trip {}. Returning existing record.", trip.getTripCode());
            return mapToDTO(existing.get());
        }

        // FR-PAY-002: Fare must be from server finalized fare
        BigDecimal totalFare = trip.getFinalFare() != null ? trip.getFinalFare() : trip.getEstimatedFare();
        if (totalFare == null || totalFare.compareTo(BigDecimal.ZERO) <= 0) {
            throw ApiException.badRequest("INVALID_FARE", "Final fare is zero or null");
        }

        PaymentMethod chosenMethod = method != null ? method : PaymentMethod.E_WALLET_SANDBOX;
        String providerRef = "SANDBOX-TX-" + System.currentTimeMillis();

        Payment payment = Payment.builder()
                .tripId(trip.getId())
                .customerId(trip.getCustomerId())
                .amount(totalFare)
                .currency(trip.getCurrency())
                .paymentMethod(chosenMethod)
                .status(PaymentStatus.SUCCEEDED)
                .providerReference(providerRef)
                .idempotencyKey(idempotencyKey != null ? idempotencyKey : UUID.randomUUID().toString())
                .build();

        Payment saved = paymentRepository.save(payment);

        // Calculate platform commission and driver net earnings (FR-WAL-003, BR-012)
        if (trip.getDriverId() != null) {
            BigDecimal commission = totalFare.multiply(PLATFORM_COMMISSION_RATE).setScale(0, RoundingMode.HALF_UP);
            BigDecimal netEarning = totalFare.subtract(commission);

            walletService.creditDriverEarning(
                    trip.getDriverId(),
                    trip.getId(),
                    trip.getTripCode(),
                    netEarning,
                    commission
            );
        }

        log.info("Payment settled for trip {}: {} VND (Method: {})",
                trip.getTripCode(), totalFare, chosenMethod);

        return mapToDTO(saved);
    }

    @Transactional(readOnly = true)
    public PaymentDTO getPaymentById(UUID paymentId) {
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> ApiException.notFound("PAYMENT_NOT_FOUND", "Payment not found: " + paymentId));
        return mapToDTO(payment);
    }

    @Transactional(readOnly = true)
    public PaymentDTO getPaymentByTrip(UUID tripId) {
        Payment payment = paymentRepository.findByTripId(tripId)
                .orElseThrow(() -> ApiException.notFound("PAYMENT_NOT_FOUND", "No payment found for trip: " + tripId));
        return mapToDTO(payment);
    }

    private PaymentDTO mapToDTO(Payment p) {
        return PaymentDTO.builder()
                .paymentId(p.getId())
                .tripId(p.getTripId())
                .customerId(p.getCustomerId())
                .amount(p.getAmount())
                .currency(p.getCurrency())
                .paymentMethod(p.getPaymentMethod())
                .status(p.getStatus())
                .providerReference(p.getProviderReference())
                .createdAt(p.getCreatedAt())
                .build();
    }
}
