package com.example.rhl.domain.pricing;

import com.example.rhl.common.BaseEntity;
import com.example.rhl.domain.driver.VehicleType;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "pricing_rules", indexes = {
    @Index(name = "idx_pricing_service_region", columnList = "service_type, vehicle_type, region")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PricingRule extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "rule_id", updatable = false, nullable = false)
    private UUID id;

    @Enumerated(EnumType.STRING)
    @Column(name = "service_type", length = 30, nullable = false)
    private ServiceType serviceType;

    @Enumerated(EnumType.STRING)
    @Column(name = "vehicle_type", length = 30, nullable = false)
    private VehicleType vehicleType;

    @Column(name = "region", length = 50, nullable = false)
    @Builder.Default
    private String region = "DEFAULT";

    @Column(name = "base_fare", precision = 15, scale = 2, nullable = false)
    private BigDecimal baseFare;

    @Column(name = "per_km_rate", precision = 15, scale = 2, nullable = false)
    private BigDecimal perKmRate;

    @Column(name = "per_minute_rate", precision = 15, scale = 2, nullable = false)
    private BigDecimal perMinuteRate;

    @Column(name = "minimum_fare", precision = 15, scale = 2, nullable = false)
    private BigDecimal minimumFare;

    @Column(name = "cancellation_fee", precision = 15, scale = 2, nullable = false)
    @Builder.Default
    private BigDecimal cancellationFee = BigDecimal.ZERO;

    @Column(name = "currency", length = 10, nullable = false)
    @Builder.Default
    private String currency = "VND";

    @Column(name = "version", nullable = false)
    @Builder.Default
    private Integer version = 1;

    @Column(name = "effective_from", nullable = false)
    private Instant effectiveFrom;

    @Column(name = "effective_to")
    private Instant effectiveTo;

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private boolean active = true;
}
