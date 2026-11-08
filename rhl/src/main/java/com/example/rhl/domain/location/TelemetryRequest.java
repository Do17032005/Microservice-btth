package com.example.rhl.domain.location;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class TelemetryRequest {
    @NotNull(message = "Latitude is required")
    private Double latitude;

    @NotNull(message = "Longitude is required")
    private Double longitude;

    private Double accuracy;
    private Long deviceTimestamp;
}
