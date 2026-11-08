package com.example.rhl.domain.dispatch;

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
public class DriverOfferDTO {
    private UUID offerId;
    private UUID tripId;
    private String tripCode;
    private UUID driverId;
    private ServiceType serviceType;
    private VehicleType vehicleType;
    private OfferStatus status;
    private String pickupAddress;
    private String dropoffAddress;
    private Long distanceMeters;
    private Long durationSeconds;
    private BigDecimal estimatedFare;
    private Instant offeredAt;
    private Instant expiresAt;
    private long remainingSeconds;
}
