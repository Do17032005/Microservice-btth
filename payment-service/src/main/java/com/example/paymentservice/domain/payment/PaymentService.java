package com.example.paymentservice.domain.payment;

import com.example.paymentservice.common.ApiException;
import com.example.paymentservice.domain.wallet.WalletService;
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
    private final WalletService walletService;

    // Default platform commission: 20% (FR-WAL-004)
    private static final BigDecimal PLATFORM_COMMISSION_RATE = BigDecimal.valueOf(0.20);

    @Transactional
    public PaymentDTO processTripPayment(PaymentRequestDTO request, String idempotencyKey) {
        UUID tripId = request.getTripId();

        // FR-PAY-003: Idempotency by trip or idempotencyKey
        Optional<Payment> existing = paymentRepository.findByTripId(tripId);
        if (existing.isPresent() && existing.get().getStatus() == PaymentStatus.SUCCEEDED) {
            log.info("Payment already completed for trip {}. Returning existing record.", tripId);
            return mapToDTO(existing.get());
        }

        BigDecimal totalFare = request.getAmount();
        if (totalFare == null || totalFare.compareTo(BigDecimal.ZERO) <= 0) {
            throw ApiException.badRequest("INVALID_FARE", "Final fare is zero or null");
        }

        PaymentMethod chosenMethod = request.getMethod() != null ? request.getMethod() : PaymentMethod.E_WALLET_SANDBOX;
        String providerRef = "SANDBOX-TX-" + System.currentTimeMillis();

        Payment payment = Payment.builder()
                .tripId(tripId)
                .customerId(request.getCustomerId())
                .amount(totalFare)
                .currency(request.getCurrency() != null ? request.getCurrency() : "VND")
                .paymentMethod(chosenMethod)
                .status(PaymentStatus.SUCCEEDED) // Sandbox completes synchronously
                .providerReference(providerRef)
                .idempotencyKey(idempotencyKey)
                .build();

        Payment saved = paymentRepository.save(payment);

        // FR-WAL-004: Deduct 20% platform commission, credit 80% net earnings to driver wallet
        if (request.getDriverId() != null) {
            BigDecimal commission = totalFare.multiply(PLATFORM_COMMISSION_RATE).setScale(0, RoundingMode.HALF_UP);
            BigDecimal driverNetEarnings = totalFare.subtract(commission);

            walletService.creditDriverEarning(request.getDriverId(), tripId, "TRIP-" + tripId.toString().substring(0, 8), driverNetEarnings, commission);
            log.info("Wallet credited for driver {}: Total={}, Commission={}, Net={}",
                    request.getDriverId(), totalFare, commission, driverNetEarnings);
        }

        log.info("Trip {} paid successfully via {}. Amount: {}", tripId, chosenMethod, totalFare);
        return mapToDTO(saved);
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
