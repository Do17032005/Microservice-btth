package com.example.rhl.domain.pricing;

import com.example.rhl.common.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/pricing")
@RequiredArgsConstructor
public class PricingController {

    private final PricingService pricingService;

    @PostMapping("/quotes")
    public ResponseEntity<ApiResponse<FareQuoteDTO>> requestQuote(
            @Valid @RequestBody QuoteRequestDTO request) {

        FareQuoteDTO quote = pricingService.generateQuote(request);
        return ResponseEntity.ok(ApiResponse.success("Fare quote generated successfully", quote));
    }

    @GetMapping("/quotes/{quoteId}")
    public ResponseEntity<ApiResponse<FareQuoteDTO>> getQuote(
            @PathVariable UUID quoteId) {

        FareQuoteDTO quote = pricingService.getQuoteById(quoteId);
        return ResponseEntity.ok(ApiResponse.success(quote));
    }
}
