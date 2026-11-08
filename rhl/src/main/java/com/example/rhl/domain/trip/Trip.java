package com.example.rhl.domain.trip;

import com.example.rhl.common.BaseEntity;
import com.example.rhl.domain.driver.VehicleType;
import com.example.rhl.domain.pricing.ServiceType;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "trips", indexes = {
    @Index(name = "idx_trip_customer", columnList = "customer_id"),
    @Index(name = "idx_trip_driver", columnList = "driver_id"),
    @Index(name = "idx_trip_status", columnList = "status"),
    @Index(name = "idx_trip_code", columnList = "trip_code", unique = true)
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Trip extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "trip_id", updatable = false, nullable = false)
    private UUID id;

    @Column(name = "trip_code", length = 32, unique = true, nullable = false)
    private String tripCode;

    @Enumerated(EnumType.STRING)
    @Column(name = "service_type", length = 30, nullable = false)
    private ServiceType serviceType;

    @Enumerated(EnumType.STRING)
    @Column(name = "vehicle_type", length = 30, nullable = false)
    private VehicleType vehicleType;

    @Column(name = "customer_id", nullable = false)
    private UUID customerId;

    @Column(name = "driver_id")
    private UUID driverId;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", length = 30, nullable = false)
    @Builder.Default
    private TripStatus status = TripStatus.CREATED;

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

    @Column(name = "distance_meters")
    private Long distanceMeters;

    @Column(name = "duration_seconds")
    private Long durationSeconds;

    @Column(name = "quote_id", nullable = false)
    private UUID quoteId;

    @Column(name = "estimated_fare", precision = 15, scale = 2, nullable = false)
    private BigDecimal estimatedFare;

    @Column(name = "final_fare", precision = 15, scale = 2)
    private BigDecimal finalFare;

    @Column(name = "surge_multiplier", precision = 5, scale = 2, nullable = false)
    @Builder.Default
    private BigDecimal surgeMultiplier = BigDecimal.valueOf(1.00);

    @Column(name = "currency", length = 10, nullable = false)
    @Builder.Default
    private String currency = "VND";

    // For Delivery
    @Column(name = "receiver_name", length = 100)
    private String receiverName;

    @Column(name = "receiver_phone", length = 20)
    private String receiverPhone;

    @Column(name = "package_description", length = 500)
    private String packageDescription;

    @Column(name = "delivery_proof_url", length = 500)
    private String deliveryProofUrl;

    @Column(name = "delivery_otp", length = 10)
    private String deliveryOtp;

    // Cancellation
    @Column(name = "cancelled_by")
    private UUID cancelledBy;

    @Column(name = "cancellation_reason", length = 500)
    private String cancellationReason;

    @Column(name = "cancellation_fee", precision = 15, scale = 2)
    private BigDecimal cancellationFee;

    // Timestamps
    @Column(name = "accepted_at")
    private Instant acceptedAt;

    @Column(name = "arrived_pickup_at")
    private Instant arrivedPickupAt;

    @Column(name = "started_at")
    private Instant startedAt;

    @Column(name = "completed_at")
    private Instant completedAt;

    @Column(name = "cancelled_at")
    private Instant cancelledAt;

    @Version
    @Column(name = "version")
    private Long version;
}
