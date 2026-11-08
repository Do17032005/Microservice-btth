package com.example.rhl.domain.location;

import com.example.rhl.domain.driver.DriverAvailabilityStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class StatusUpdateRequest {
    @NotNull(message = "Availability status is required")
    private DriverAvailabilityStatus status;
}
