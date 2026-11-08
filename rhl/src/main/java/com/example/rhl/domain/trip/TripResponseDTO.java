package com.example.rhl.domain.trip;

import com.example.rhl.domain.driver.VehicleType;
import com.example.rhl.domain.pricing.ServiceType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TripResponseDTO {
    private UUID tripId;
    private String tripCode;
    private ServiceType serviceType;
    private VehicleType vehicleType;
    private UUID customerId;
    private UUID driverId;
    private TripStatus status;
    private Double pickupLatitude;
    private Double pickupLongitude;
    private String pickupAddress;
    private Double dropoffLatitude;
    private Double dropoffLongitude;
    private String dropoffAddress;
    private Long distanceMeters;
    private Long durationSeconds;
    private BigDecimal estimatedFare;
    private BigDecimal finalFare;
    private BigDecimal surgeMultiplier;
    private String currency;
    private String receiverName;
    private String receiverPhone;
    private String packageDescription;
    private String cancellationReason;
    private String deliveryOtp;
    private Instant createdAt;
    private Instant acceptedAt;
    private Instant startedAt;
    private Instant completedAt;
    private Instant cancelledAt;
}
