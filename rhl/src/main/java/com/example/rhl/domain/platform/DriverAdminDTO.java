package com.example.rhl.domain.platform;

import com.example.rhl.domain.driver.DriverAvailabilityStatus;
import com.example.rhl.domain.driver.DriverReviewStatus;
import com.example.rhl.domain.driver.VehicleType;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.time.Instant;
import java.util.UUID;

public class DriverAdminDTO {

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ReviewRequest {
        @NotNull(message = "Review status is required")
        private DriverReviewStatus reviewStatus; // APPROVED or REJECTED

        private String rejectionReason;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class DetailResponse {
        private UUID driverId;
        private String fullName;
        private String phoneNumber;
        private String licenseNumber;
        private DriverReviewStatus reviewStatus;
        private DriverAvailabilityStatus availabilityStatus;
        private Double rating;
        private String vehiclePlate;
        private VehicleType vehicleType;
        private String vehicleModel;
        private String rejectionReason;
        private Instant approvedAt;
        private Instant createdAt;
    }
}
