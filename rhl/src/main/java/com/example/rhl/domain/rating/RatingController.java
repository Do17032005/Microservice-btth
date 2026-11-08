package com.example.rhl.domain.rating;

import com.example.rhl.common.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
public class RatingController {

    private final RatingService ratingService;

    @PostMapping("/trips/{tripId}/rating")
    @PreAuthorize("hasAnyRole('CUSTOMER', 'ADMIN')")
    public ResponseEntity<ApiResponse<RatingDTO.Response>> submitRating(
            @PathVariable UUID tripId,
            @Valid @RequestBody RatingDTO.CreateRequest request,
            Authentication authentication) {

        UUID customerId = null;
        if (authentication != null && authentication.getPrincipal() instanceof UUID userId) {
            customerId = userId;
        }

        RatingDTO.Response response = ratingService.submitRating(tripId, customerId, request);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/trips/{tripId}/rating")
    public ResponseEntity<ApiResponse<RatingDTO.Response>> getRatingByTrip(@PathVariable UUID tripId) {
        RatingDTO.Response response = ratingService.getRatingByTrip(tripId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/drivers/{driverId}/ratings")
    public ResponseEntity<ApiResponse<List<RatingDTO.Response>>> getRatingsByDriver(@PathVariable UUID driverId) {
        List<RatingDTO.Response> list = ratingService.getRatingsByDriver(driverId);
        return ResponseEntity.ok(ApiResponse.success(list));
    }
}
