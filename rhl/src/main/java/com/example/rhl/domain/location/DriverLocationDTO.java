package com.example.rhl.domain.location;

import com.example.rhl.domain.driver.VehicleType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DriverLocationDTO {
    private UUID driverId;
    private String driverName;
    private String phoneNumber;
    private Double rating;
    private VehicleType vehicleType;
    private String plateNumber;
    private double latitude;
    private double longitude;
    private double distanceKm;
    private long etaMinutes;
    private Instant lastUpdated;
}
