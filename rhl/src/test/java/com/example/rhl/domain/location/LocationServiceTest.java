package com.example.rhl.domain.location;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

class LocationServiceTest {

    private InMemorySpatialIndexService spatialIndexService;

    @BeforeEach
    void setUp() {
        spatialIndexService = new InMemorySpatialIndexService();
    }

    @Test
    @DisplayName("Spatial index should accurately calculate Haversine distance and sort nearby drivers")
    void testNearbySearchDistanceAndSorting() {
        // Customer at Hoan Kiem Lake, Hanoi: (21.0285, 105.8542)
        double customerLat = 21.0285;
        double customerLng = 105.8542;

        UUID driverNear = UUID.randomUUID();
        UUID driverFar = UUID.randomUUID();
        UUID driverOutOfRange = UUID.randomUUID();

        // ~0.15 km away
        spatialIndexService.updateLocation(driverNear, 21.0295, 105.8550);
        // ~1.2 km away
        spatialIndexService.updateLocation(driverFar, 21.0380, 105.8500);
        // ~15 km away (out of 5km radius)
        spatialIndexService.updateLocation(driverOutOfRange, 20.9000, 105.8000);

        List<SpatialIndexService.DriverDistance> nearby =
                spatialIndexService.searchNearby(customerLat, customerLng, 5.0, 10);

        assertEquals(2, nearby.size(), "Should only return 2 drivers within 5km radius");
        assertEquals(driverNear, nearby.get(0).driverId(), "Closest driver should be first");
        assertTrue(nearby.get(0).distanceKm() < nearby.get(1).distanceKm(), "List must be ordered by distance ascending");
        assertTrue(nearby.get(0).distanceKm() < 0.5, "Closest driver distance should be < 0.5km");
    }

    @Test
    @DisplayName("Spatial index should exclude stale driver pings exceeding threshold")
    void testStaleDriverExclusion() {
        UUID driverStale = UUID.randomUUID();
        // Update driver
        spatialIndexService.updateLocation(driverStale, 21.0285, 105.8542);

        // Manually remove
        spatialIndexService.removeLocation(driverStale);

        List<SpatialIndexService.DriverDistance> result =
                spatialIndexService.searchNearby(21.0285, 105.8542, 5.0, 10);

        assertTrue(result.isEmpty(), "Removed driver must not appear in search results");
    }

    @Test
    @DisplayName("Performance test: Spatial query for 100 drivers must complete in < 20ms (NFR-PERF-003)")
    void testSpatialIndexPerformance() {
        for (int i = 0; i < 100; i++) {
            double randomOffset = (i * 0.001);
            spatialIndexService.updateLocation(UUID.randomUUID(), 21.0285 + randomOffset, 105.8542 + randomOffset);
        }

        long start = System.nanoTime();
        List<SpatialIndexService.DriverDistance> result =
                spatialIndexService.searchNearby(21.0285, 105.8542, 10.0, 50);
        long durationMs = (System.nanoTime() - start) / 1_000_000;

        assertFalse(result.isEmpty());
        assertTrue(durationMs < 20, "Query time (" + durationMs + "ms) must be under 20ms per NFR-PERF-003");
    }
}
