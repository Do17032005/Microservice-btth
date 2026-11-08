package com.example.rhl.domain.payment;

import com.example.rhl.common.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    @PostMapping("/trips/{tripId}")
    public ResponseEntity<ApiResponse<PaymentDTO>> payTrip(
            @PathVariable UUID tripId,
            @RequestHeader(value = "Idempotency-Key", required = false) String idempotencyKey,
            @RequestBody(required = false) PaymentRequestDTO request) {

        PaymentMethod method = request != null && request.getMethod() != null
                ? request.getMethod()
                : PaymentMethod.E_WALLET_SANDBOX;

        PaymentDTO payment = paymentService.processTripPayment(tripId, method, idempotencyKey);
        return ResponseEntity.ok(ApiResponse.success("Payment processed successfully", payment));
    }

    @GetMapping("/{paymentId}")
    public ResponseEntity<ApiResponse<PaymentDTO>> getPayment(
            @PathVariable UUID paymentId) {

        PaymentDTO payment = paymentService.getPaymentById(paymentId);
        return ResponseEntity.ok(ApiResponse.success(payment));
    }

    @GetMapping("/trips/{tripId}")
    public ResponseEntity<ApiResponse<PaymentDTO>> getPaymentByTrip(
            @PathVariable UUID tripId) {

        PaymentDTO payment = paymentService.getPaymentByTrip(tripId);
        return ResponseEntity.ok(ApiResponse.success(payment));
    }
}
