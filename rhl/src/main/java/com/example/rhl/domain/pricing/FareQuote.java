package com.example.rhl.domain.pricing;

import com.example.rhl.common.BaseEntity;
import com.example.rhl.domain.driver.VehicleType;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "fare_quotes", indexes = {
    @Index(name = "idx_quote_customer", columnList = "customer_id"),
    @Index(name = "idx_quote_expires", columnList = "expires_at")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FareQuote extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "quote_id", updatable = false, nullable = false)
    private UUID id;

    @Column(name = "customer_id", nullable = false)
    private UUID customerId;

    @Enumerated(EnumType.STRING)
    @Column(name = "service_type", length = 30, nullable = false)
    private ServiceType serviceType;

    @Enumerated(EnumType.STRING)
    @Column(name = "vehicle_type", length = 30, nullable = false)
    private VehicleType vehicleType;

    @Column(name = "pickup_latitude", nullable = false)
    private Double pickupLatitude;

    @Column(name = "pickup_longitude", nullable = false)
    private Double pickupLongitude;

    @Column(name = "pickup_address", length = 500, nullable = false)
    private String pickupAddress;

    @Column(name = "dropoff_latitude", nullable = false)
    private Double dropoffLatitude;

    @Column(name = "dropoff_longitude", nullable = false)
    private Double dropoffLongitude;

    @Column(name = "dropoff_address", length = 500, nullable = false)
    private String dropoffAddress;

    @Column(name = "distance_meters", nullable = false)
    private Long distanceMeters;

    @Column(name = "duration_seconds", nullable = false)
    private Long durationSeconds;

    @Column(name = "base_fare", precision = 15, scale = 2, nullable = false)
    private BigDecimal baseFare;

    @Column(name = "distance_fare", precision = 15, scale = 2, nullable = false)
    private BigDecimal distanceFare;

    @Column(name = "time_fare", precision = 15, scale = 2, nullable = false)
    private BigDecimal timeFare;

    @Column(name = "surge_multiplier", precision = 5, scale = 2, nullable = false)
    @Builder.Default
    private BigDecimal surgeMultiplier = BigDecimal.valueOf(1.00);

    @Column(name = "total_fare", precision = 15, scale = 2, nullable = false)
    private BigDecimal totalFare;

    @Column(name = "currency", length = 10, nullable = false)
    @Builder.Default
    private String currency = "VND";

    @Column(name = "rule_version", nullable = false)
    private Integer ruleVersion;

    @Column(name = "expires_at", nullable = false)
    private Instant expiresAt;

    @Column(name = "is_used", nullable = false)
    @Builder.Default
    private boolean used = false;
}
