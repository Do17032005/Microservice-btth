package com.example.rhl.domain.platform;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

/**
 * Session 10: Event phát qua Apache Kafka khi chuyến đi hoàn thành
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TripCompletedEvent {
    private UUID tripId;
    private String tripCode;
    private UUID customerId;
    private UUID driverId;
    private BigDecimal finalFare;
    private String currency;
    private Instant completedAt;
}
