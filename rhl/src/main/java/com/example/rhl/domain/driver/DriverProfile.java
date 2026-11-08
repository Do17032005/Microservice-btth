package com.example.rhl.domain.driver;

import com.example.rhl.common.BaseEntity;
import com.example.rhl.domain.user.User;
import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "driver_profiles", indexes = {
    @Index(name = "idx_driver_user_id", columnList = "user_id", unique = true),
    @Index(name = "idx_driver_availability", columnList = "availability_status"),
    @Index(name = "idx_driver_review", columnList = "review_status")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DriverProfile extends BaseEntity {

    @Id
    @Column(name = "driver_id", nullable = false)
    private UUID id;

    @OneToOne(fetch = FetchType.LAZY)
    @MapsId
    @JoinColumn(name = "driver_id")
    private User user;

    @Column(name = "license_number", length = 50, unique = true)
    private String licenseNumber;

    @Enumerated(EnumType.STRING)
    @Column(name = "review_status", length = 30, nullable = false)
    @Builder.Default
    private DriverReviewStatus reviewStatus = DriverReviewStatus.DRAFT;

    @Enumerated(EnumType.STRING)
    @Column(name = "availability_status", length = 30, nullable = false)
    @Builder.Default
    private DriverAvailabilityStatus availabilityStatus = DriverAvailabilityStatus.OFFLINE;

    @Column(name = "rejection_reason", length = 500)
    private String rejectionReason;

    @Column(name = "rating")
    @Builder.Default
    private Double rating = 5.0;

    @Column(name = "approved_at")
    private Instant approvedAt;

    @Column(name = "approved_by")
    private UUID approvedBy;

    @Version
    @Column(name = "version")
    private Long version;
}
