package com.example.rhl.domain.location;

import com.example.rhl.common.ApiException;
import com.example.rhl.domain.driver.*;
import com.example.rhl.domain.user.User;
import com.example.rhl.domain.user.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class LocationService {

    private final SpatialIndexService spatialIndexService;
    private final DriverProfileRepository driverProfileRepository;
    private final VehicleRepository vehicleRepository;
    private final UserRepository userRepository;

    @Transactional
    public void updateTelemetry(UUID driverId, double latitude, double longitude, Double accuracy) {
        // Validate coordinates (FR-LOC-003)
        if (latitude < -90.0 || latitude > 90.0 || longitude < -180.0 || longitude > 180.0) {
            throw ApiException.badRequest("INVALID_COORDINATES", "Latitude must be [-90, 90] and Longitude [-180, 180]");
        }

        DriverProfile driver = driverProfileRepository.findById(driverId)
                .orElseThrow(() -> ApiException.notFound("DRIVER_NOT_FOUND", "Driver not found: " + driverId));

        if (driver.getReviewStatus() != DriverReviewStatus.APPROVED) {
            throw ApiException.badRequest("DRIVER_NOT_APPROVED", "Driver profile is not approved");
        }

        // Only index location if driver is AVAILABLE or active in trip
        if (driver.getAvailabilityStatus() == DriverAvailabilityStatus.AVAILABLE
                || driver.getAvailabilityStatus() == DriverAvailabilityStatus.OFFERED
                || driver.getAvailabilityStatus() == DriverAvailabilityStatus.BUSY) {
            spatialIndexService.updateLocation(driverId, latitude, longitude);
            log.debug("Telemetry updated for driver {}: ({}, {})", driverId, latitude, longitude);
        }
    }

    @Transactional
    public void setDriverAvailability(UUID driverId, DriverAvailabilityStatus newStatus) {
        DriverProfile driver = driverProfileRepository.findById(driverId)
                .orElseThrow(() -> ApiException.notFound("DRIVER_NOT_FOUND", "Driver not found: " + driverId));

        if (driver.getReviewStatus() != DriverReviewStatus.APPROVED) {
            throw ApiException.badRequest("DRIVER_NOT_APPROVED", "Only approved drivers can go online");
        }

        // FR-DRV-011: Driver cannot switch to offline while busy in trip
        if (driver.getAvailabilityStatus() == DriverAvailabilityStatus.BUSY && newStatus == DriverAvailabilityStatus.OFFLINE) {
            throw ApiException.badRequest("DRIVER_BUSY", "Cannot go offline while in an active trip");
        }

        if (newStatus == DriverAvailabilityStatus.AVAILABLE) {
            // Check vehicle
            List<Vehicle> vehicles = vehicleRepository.findByDriverId(driverId);
            boolean hasActiveVehicle = vehicles.stream().anyMatch(Vehicle::isActive);
            if (!hasActiveVehicle) {
                throw ApiException.badRequest("NO_ACTIVE_VEHICLE", "Driver must have at least one active vehicle to go online");
            }
        } else if (newStatus == DriverAvailabilityStatus.OFFLINE) {
            spatialIndexService.removeLocation(driverId);
        }

        driver.setAvailabilityStatus(newStatus);
        driverProfileRepository.save(driver);
        log.info("Driver {} availability changed to {}", driverId, newStatus);
    }

    @Transactional(readOnly = true)
    public List<DriverLocationDTO> findNearbyAvailableDrivers(
            double latitude, double longitude, double radiusKm, VehicleType vehicleType, int limit) {

        List<SpatialIndexService.DriverDistance> nearby =
                spatialIndexService.searchNearby(latitude, longitude, radiusKm, limit * 3);

        List<DriverLocationDTO> result = new ArrayList<>();

        for (SpatialIndexService.DriverDistance dd : nearby) {
            DriverProfile profile = driverProfileRepository.findById(dd.driverId()).orElse(null);
            if (profile == null || profile.getAvailabilityStatus() != DriverAvailabilityStatus.AVAILABLE) {
                continue;
            }

            List<Vehicle> vehicles = vehicleRepository.findByDriverId(dd.driverId());
            Vehicle matchingVehicle = vehicles.stream()
                    .filter(v -> v.isActive() && (vehicleType == null || v.getVehicleType() == vehicleType))
                    .findFirst()
                    .orElse(null);

            if (matchingVehicle == null) {
                continue;
            }

            User user = userRepository.findById(dd.driverId()).orElse(null);
            String driverName = user != null ? user.getFullName() : "Driver";
            String phone = user != null ? user.getPhoneNumber() : "";

            // Calculate estimated ETA: assume 25 km/h urban speed -> ~2.4 mins per km
            long etaMinutes = Math.max(1, Math.round(dd.distanceKm() * 2.4));

            result.add(DriverLocationDTO.builder()
                    .driverId(dd.driverId())
                    .driverName(driverName)
                    .phoneNumber(phone)
                    .rating(profile.getRating())
                    .vehicleType(matchingVehicle.getVehicleType())
                    .plateNumber(matchingVehicle.getPlateNumber())
                    .latitude(dd.latitude())
                    .longitude(dd.longitude())
                    .distanceKm(dd.distanceKm())
                    .etaMinutes(etaMinutes)
                    .lastUpdated(Instant.now())
                    .build());

            if (result.size() >= limit) {
                break;
            }
        }

        return result;
    }
}
