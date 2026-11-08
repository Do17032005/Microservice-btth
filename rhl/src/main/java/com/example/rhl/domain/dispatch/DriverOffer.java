package com.example.rhl.domain.dispatch;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "driver_offers", indexes = {
    @Index(name = "idx_offer_trip", columnList = "trip_id"),
    @Index(name = "idx_offer_driver", columnList = "driver_id"),
    @Index(name = "idx_offer_status", columnList = "status")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DriverOffer {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "offer_id", updatable = false, nullable = false)
    private UUID id;

    @Column(name = "trip_id", nullable = false)
    private UUID tripId;

    @Column(name = "driver_id", nullable = false)
    private UUID driverId;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", length = 30, nullable = false)
    @Builder.Default
    private OfferStatus status = OfferStatus.OFFERED;

    @Column(name = "offered_at", nullable = false)
    private Instant offeredAt;

    @Column(name = "expires_at", nullable = false)
    private Instant expiresAt;

    @Column(name = "responded_at")
    private Instant respondedAt;

    @Version
    @Column(name = "version")
    private Long version;
}
