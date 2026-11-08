package com.example.rhl.domain.payment;

import com.example.rhl.common.ApiResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;

/**
 * Session 07: Giao tiếp đồng bộ giữa các service bằng OpenFeign
 * trip-service gọi sang payment-service qua tên đăng ký trên Eureka "payment-service"
 */
@FeignClient(name = "payment-service")
public interface PaymentClient {

    @PostMapping("/api/v1/payments/process")
    ApiResponse<PaymentDTO> processPayment(
            @RequestHeader(value = "Idempotency-Key", required = false) String idempotencyKey,
            @RequestBody ProcessPaymentRequest request
    );
}
