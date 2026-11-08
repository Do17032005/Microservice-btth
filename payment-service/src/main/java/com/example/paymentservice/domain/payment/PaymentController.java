package com.example.paymentservice.domain.payment;

import com.example.paymentservice.common.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    @PostMapping("/process")
    public ResponseEntity<ApiResponse<PaymentDTO>> processPayment(
            @RequestHeader(value = "Idempotency-Key", required = false) String idempotencyKey,
            @Valid @RequestBody PaymentRequestDTO request) {

        PaymentDTO response = paymentService.processTripPayment(request, idempotencyKey);
        return ResponseEntity.ok(ApiResponse.success("Payment processed successfully", response));
    }

    @GetMapping("/trips/{tripId}")
    public ResponseEntity<ApiResponse<PaymentDTO>> getPaymentByTrip(@PathVariable UUID tripId) {
        PaymentDTO response = paymentService.getPaymentByTrip(tripId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }
}
