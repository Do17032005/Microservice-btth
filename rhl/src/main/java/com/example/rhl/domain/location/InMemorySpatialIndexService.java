package com.example.rhl.domain.location;

import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class InMemorySpatialIndexService implements SpatialIndexService {

    private static final double EARTH_RADIUS_KM = 6371.0;
    private static final long STALE_THRESHOLD_SECONDS = 30; // Consider stale if no ping for 30s

    public record DriverCoordinate(double latitude, double longitude, Instant lastPing) {}

    private final Map<UUID, DriverCoordinate> index = new ConcurrentHashMap<>();

    @Override
    public void updateLocation(UUID driverId, double latitude, double longitude) {
        index.put(driverId, new DriverCoordinate(latitude, longitude, Instant.now()));
    }

    @Override
    public void removeLocation(UUID driverId) {
        index.remove(driverId);
    }

    @Override
    public List<DriverDistance> searchNearby(double latitude, double longitude, double radiusKm, int limit) {
        Instant threshold = Instant.now().minusSeconds(STALE_THRESHOLD_SECONDS);

        return index.entrySet().stream()
                .filter(entry -> entry.getValue().lastPing().isAfter(threshold))
                .map(entry -> {
                    double dist = calculateHaversineDistanceKm(
                            latitude, longitude,
                            entry.getValue().latitude(), entry.getValue().longitude()
                    );
                    return new DriverDistance(
                            entry.getKey(),
                            entry.getValue().latitude(),
                            entry.getValue().longitude(),
                            Math.round(dist * 100.0) / 100.0
                    );
                })
                .filter(d -> d.distanceKm() <= radiusKm)
                .sorted(Comparator.comparingDouble(DriverDistance::distanceKm))
                .limit(limit)
                .toList();
    }

    public static double calculateHaversineDistanceKm(double lat1, double lon1, double lat2, double lon2) {
        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);

        double rLat1 = Math.toRadians(lat1);
        double rLat2 = Math.toRadians(lat2);

        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(rLat1) * Math.cos(rLat2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return EARTH_RADIUS_KM * c;
    }
}
