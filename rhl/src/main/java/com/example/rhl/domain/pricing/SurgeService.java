package com.example.rhl.domain.pricing;

import com.example.rhl.domain.location.SpatialIndexService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class SurgeService {

    private final SpatialIndexService spatialIndexService;

    private static final double SURGE_RADIUS_KM = 3.0;
    private static final BigDecimal MIN_SURGE = BigDecimal.valueOf(1.00);
    private static final BigDecimal MAX_SURGE = BigDecimal.valueOf(2.50);

    public BigDecimal calculateSurgeMultiplier(double pickupLat, double pickupLng) {
        // Query available drivers nearby
        List<SpatialIndexService.DriverDistance> drivers =
                spatialIndexService.searchNearby(pickupLat, pickupLng, SURGE_RADIUS_KM, 20);

        int availableDrivers = drivers.size();

        BigDecimal multiplier;
        if (availableDrivers == 0) {
            multiplier = BigDecimal.valueOf(1.80); // High demand, no drivers nearby
        } else if (availableDrivers == 1) {
            multiplier = BigDecimal.valueOf(1.40);
        } else if (availableDrivers <= 3) {
            multiplier = BigDecimal.valueOf(1.20);
        } else {
            multiplier = BigDecimal.valueOf(1.00); // Plentiful drivers
        }

        // Clamp between [1.00, 2.50]
        if (multiplier.compareTo(MIN_SURGE) < 0) {
            multiplier = MIN_SURGE;
        } else if (multiplier.compareTo(MAX_SURGE) > 0) {
            multiplier = MAX_SURGE;
        }

        multiplier = multiplier.setScale(2, RoundingMode.HALF_UP);
        log.debug("Surge calculated at ({}, {}): {}x (available drivers: {})",
                pickupLat, pickupLng, multiplier, availableDrivers);

        return multiplier;
    }
}
