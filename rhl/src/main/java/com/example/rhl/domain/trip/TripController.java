package com.example.rhl.domain.trip;

import com.example.rhl.common.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
public class TripController {

    private final TripService tripService;

    @PostMapping("/trips")
    public ResponseEntity<ApiResponse<TripResponseDTO>> createTrip(
            @RequestHeader(value = "Idempotency-Key", required = false) String idempotencyKey,
            @Valid @RequestBody CreateTripRequestDTO request) {

        TripResponseDTO trip = tripService.createTrip(request, idempotencyKey);
        return ResponseEntity.ok(ApiResponse.success("Trip created and dispatched to drivers", trip));
    }

    @GetMapping("/trips/{tripId}")
    public ResponseEntity<ApiResponse<TripResponseDTO>> getTrip(
            @PathVariable UUID tripId) {

        TripResponseDTO trip = tripService.getTripById(tripId);
        return ResponseEntity.ok(ApiResponse.success(trip));
    }

    @PostMapping("/trips/{tripId}/status")
    public ResponseEntity<ApiResponse<TripResponseDTO>> updateStatus(
            @PathVariable UUID tripId,
            @Valid @RequestBody TripStatusUpdateRequest request) {

        TripResponseDTO trip = tripService.updateTripStatus(
                tripId,
                request.getActorId(),
                request.getStatus(),
                request.getLatitude(),
                request.getLongitude(),
                request.getReason(),
                request.getDeliveryOtp()
        );
        return ResponseEntity.ok(ApiResponse.success("Trip status updated to " + request.getStatus(), trip));
    }

    @PostMapping("/trips/{tripId}/cancel")
    public ResponseEntity<ApiResponse<TripResponseDTO>> cancelTrip(
            @PathVariable UUID tripId,
            @Valid @RequestBody TripCancelRequest request) {

        TripResponseDTO trip = tripService.cancelTrip(tripId, request.getActorId(), request.getReason());
        return ResponseEntity.ok(ApiResponse.success("Trip cancelled", trip));
    }

    @GetMapping("/customers/{customerId}/trips")
    public ResponseEntity<ApiResponse<List<TripResponseDTO>>> getCustomerTrips(
            @PathVariable UUID customerId) {

        List<TripResponseDTO> trips = tripService.getTripsByCustomer(customerId);
        return ResponseEntity.ok(ApiResponse.success(trips));
    }

    @GetMapping("/drivers/{driverId}/trips")
    public ResponseEntity<ApiResponse<List<TripResponseDTO>>> getDriverTrips(
            @PathVariable UUID driverId) {

        List<TripResponseDTO> trips = tripService.getTripsByDriver(driverId);
        return ResponseEntity.ok(ApiResponse.success(trips));
    }
}
