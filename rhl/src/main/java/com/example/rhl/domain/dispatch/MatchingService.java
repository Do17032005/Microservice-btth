package com.example.rhl.domain.dispatch;

import com.example.rhl.domain.driver.DriverAvailabilityStatus;
import com.example.rhl.domain.driver.DriverProfile;
import com.example.rhl.domain.driver.DriverProfileRepository;
import com.example.rhl.domain.location.DriverLocationDTO;
import com.example.rhl.domain.location.LocationService;
import com.example.rhl.domain.trip.Trip;
import com.example.rhl.domain.trip.TripRepository;
import com.example.rhl.domain.trip.TripStatus;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class MatchingService {

    private final LocationService locationService;
    private final DriverOfferRepository driverOfferRepository;
    private final DriverProfileRepository driverProfileRepository;
    private final TripRepository tripRepository;
    private final com.example.rhl.domain.realtime.RealtimeEventPublisher realtimeEventPublisher;

    private static final double INITIAL_SEARCH_RADIUS_KM = 5.0;
    private static final int OFFER_EXPIRY_SECONDS = 15;

    @Transactional
    public void triggerMatching(Trip trip) {
        log.info("Triggering matching for trip {} (Vehicle: {})", trip.getTripCode(), trip.getVehicleType());

        // 1. Search nearby available drivers matching vehicle type (FR-MAT-001, FR-MAT-002)
        List<DriverLocationDTO> candidates = locationService.findNearbyAvailableDrivers(
                trip.getPickupLatitude(),
                trip.getPickupLongitude(),
                INITIAL_SEARCH_RADIUS_KM,
                trip.getVehicleType(),
                3 // top 3 candidates
        );

        if (candidates.isEmpty()) {
            log.warn("No available drivers found for trip {}", trip.getTripCode());
            trip.setStatus(TripStatus.NO_DRIVER);
            tripRepository.save(trip);
            return;
        }

        Instant now = Instant.now();
        Instant expiresAt = now.plusSeconds(OFFER_EXPIRY_SECONDS);

        // 2. Dispatch offer to candidates (FR-MAT-007)
        for (DriverLocationDTO driver : candidates) {
            DriverOffer offer = DriverOffer.builder()
                    .tripId(trip.getId())
                    .driverId(driver.getDriverId())
                    .status(OfferStatus.OFFERED)
                    .offeredAt(now)
                    .expiresAt(expiresAt)
                    .build();

            driverOfferRepository.save(offer);

            // Mark driver availability to OFFERED to avoid conflicting offers (FR-DRV-012)
            driverProfileRepository.findById(driver.getDriverId()).ifPresent(p -> {
                p.setAvailabilityStatus(DriverAvailabilityStatus.OFFERED);
                driverProfileRepository.save(p);
            });

            // FR-RT-002: Push offer to driver screen via WebSocket
            realtimeEventPublisher.sendOfferToDriver(driver.getDriverId(), offer);

            log.info("Dispatched offer {} to driver {} for trip {}",
                    offer.getId(), driver.getDriverId(), trip.getTripCode());
        }
    }
}
