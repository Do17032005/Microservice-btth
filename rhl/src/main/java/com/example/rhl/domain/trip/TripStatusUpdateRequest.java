package com.example.rhl.domain.trip;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.UUID;

@Data
public class TripStatusUpdateRequest {
    @NotNull(message = "Actor ID is required")
    private UUID actorId;

    @NotNull(message = "New status is required")
    private TripStatus status;

    private Double latitude;
    private Double longitude;
    private String reason;
    private String deliveryOtp;
}
