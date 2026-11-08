package com.example.rhl.domain.platform;

import com.example.rhl.common.ApiResponse;
import com.example.rhl.domain.pricing.PricingRule;
import com.example.rhl.domain.trip.TripResponseDTO;
import com.example.rhl.domain.trip.TripStatus;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final AdminService adminService;

    @GetMapping("/drivers/pending")
    public ResponseEntity<ApiResponse<List<DriverAdminDTO.DetailResponse>>> getPendingDrivers() {
        List<DriverAdminDTO.DetailResponse> drivers = adminService.getPendingDrivers();
        return ResponseEntity.ok(ApiResponse.success(drivers));
    }

    @GetMapping("/drivers")
    public ResponseEntity<ApiResponse<List<DriverAdminDTO.DetailResponse>>> getAllDrivers() {
        List<DriverAdminDTO.DetailResponse> drivers = adminService.getAllDrivers();
        return ResponseEntity.ok(ApiResponse.success(drivers));
    }

    @PostMapping("/drivers/{driverId}/review")
    public ResponseEntity<ApiResponse<DriverAdminDTO.DetailResponse>> reviewDriver(
            @PathVariable UUID driverId,
            @Valid @RequestBody DriverAdminDTO.ReviewRequest request,
            Authentication authentication) {

        UUID reviewerId = null;
        if (authentication != null && authentication.getPrincipal() instanceof UUID userId) {
            reviewerId = userId;
        }

        DriverAdminDTO.DetailResponse response = adminService.reviewDriver(driverId, reviewerId, request);
        return ResponseEntity.ok(ApiResponse.success("Driver review updated successfully", response));
    }

    @GetMapping("/trips")
    public ResponseEntity<ApiResponse<List<TripResponseDTO>>> getAllTrips(
            @RequestParam(required = false) TripStatus status) {
        List<TripResponseDTO> trips = adminService.getAllTrips(status);
        return ResponseEntity.ok(ApiResponse.success(trips));
    }

    @GetMapping("/pricing-rules")
    public ResponseEntity<ApiResponse<List<PricingRule>>> getAllPricingRules() {
        List<PricingRule> rules = adminService.getAllPricingRules();
        return ResponseEntity.ok(ApiResponse.success(rules));
    }
}
