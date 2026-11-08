package com.example.rhl.domain.trip;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.UUID;

@Data
public class TripCancelRequest {
    @NotNull(message = "Actor ID is required")
    private UUID actorId;

    private String reason;
}
