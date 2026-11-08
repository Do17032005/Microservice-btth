package com.example.rhl.domain.location;

import com.example.rhl.common.ApiResponse;
import com.example.rhl.domain.driver.VehicleType;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
public class LocationController {

    private final LocationService locationService;

    @PostMapping("/drivers/{driverId}/telemetry")
    public ResponseEntity<ApiResponse<String>> sendTelemetry(
            @PathVariable UUID driverId,
            @Valid @RequestBody TelemetryRequest request) {

        locationService.updateTelemetry(
                driverId,
                request.getLatitude(),
                request.getLongitude(),
                request.getAccuracy()
        );

        return ResponseEntity.ok(ApiResponse.success("Telemetry updated successfully", null));
    }

    @PostMapping("/drivers/{driverId}/status")
    public ResponseEntity<ApiResponse<String>> updateStatus(
            @PathVariable UUID driverId,
            @Valid @RequestBody StatusUpdateRequest request) {

        locationService.setDriverAvailability(driverId, request.getStatus());
        return ResponseEntity.ok(ApiResponse.success("Driver status updated to " + request.getStatus(), null));
    }

    @GetMapping("/locations/nearby-drivers")
    public ResponseEntity<ApiResponse<List<DriverLocationDTO>>> getNearbyDrivers(
            @RequestParam double latitude,
            @RequestParam double longitude,
            @RequestParam(defaultValue = "5.0") double radiusKm,
            @RequestParam(required = false) VehicleType vehicleType,
            @RequestParam(defaultValue = "10") int limit) {

        List<DriverLocationDTO> drivers = locationService.findNearbyAvailableDrivers(
                latitude, longitude, radiusKm, vehicleType, limit
        );

        return ResponseEntity.ok(ApiResponse.success(drivers));
    }
}
