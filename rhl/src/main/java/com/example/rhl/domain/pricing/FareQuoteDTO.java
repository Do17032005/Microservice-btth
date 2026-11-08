package com.example.rhl.domain.pricing;

import com.example.rhl.domain.driver.VehicleType;
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
public class FareQuoteDTO {
    private UUID quoteId;
    private UUID customerId;
    private ServiceType serviceType;
    private VehicleType vehicleType;
    private String pickupAddress;
    private String dropoffAddress;
    private double distanceKm;
    private long durationMinutes;
    private BigDecimal baseFare;
    private BigDecimal distanceFare;
    private BigDecimal timeFare;
    private BigDecimal surgeMultiplier;
    private BigDecimal totalFare;
    private String currency;
    private Integer ruleVersion;
    private Instant expiresAt;
    private boolean isExpired;
}
