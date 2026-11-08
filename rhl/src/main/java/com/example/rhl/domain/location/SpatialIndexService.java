package com.example.rhl.domain.location;

import java.util.List;
import java.util.UUID;

public interface SpatialIndexService {

    record DriverDistance(UUID driverId, double latitude, double longitude, double distanceKm) {}

    void updateLocation(UUID driverId, double latitude, double longitude);

    void removeLocation(UUID driverId);

    List<DriverDistance> searchNearby(double latitude, double longitude, double radiusKm, int limit);
}
