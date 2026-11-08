package com.example.rhl.domain.pricing;

import com.example.rhl.domain.location.InMemorySpatialIndexService;
import lombok.Builder;
import lombok.Data;
import org.springframework.stereotype.Service;

@Service
public class RoutingService {

    private static final double ROAD_CURVATURE_FACTOR = 1.30; // Road distance is ~30% longer than straight-line
    private static final double AVERAGE_URBAN_SPEED_KMH = 28.0; // 28 km/h average speed in city

    public record RouteEstimate(long distanceMeters, long durationSeconds) {}

    public RouteEstimate estimateRoute(double fromLat, double fromLng, double toLat, double toLng) {
        double straightDistanceKm = InMemorySpatialIndexService.calculateHaversineDistanceKm(fromLat, fromLng, toLat, toLng);
        
        // Ensure at least 500m minimum
        double roadDistanceKm = Math.max(0.5, straightDistanceKm * ROAD_CURVATURE_FACTOR);
        long distanceMeters = Math.round(roadDistanceKm * 1000.0);

        // Duration in seconds: (distanceKm / speedKmh) * 3600
        double durationHours = roadDistanceKm / AVERAGE_URBAN_SPEED_KMH;
        long durationSeconds = Math.max(120, Math.round(durationHours * 3600.0)); // minimum 2 mins

        return new RouteEstimate(distanceMeters, durationSeconds);
    }
}
