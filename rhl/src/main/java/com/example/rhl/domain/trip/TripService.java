package com.example.rhl.domain.trip;

import com.example.rhl.common.ApiException;
import com.example.rhl.domain.dispatch.DriverOffer;
import com.example.rhl.domain.dispatch.DriverOfferDTO;
import com.example.rhl.domain.dispatch.DriverOfferRepository;
import com.example.rhl.domain.dispatch.MatchingService;
import com.example.rhl.domain.dispatch.OfferStatus;
import com.example.rhl.domain.driver.DriverAvailabilityStatus;
import com.example.rhl.domain.driver.DriverProfile;
import com.example.rhl.domain.driver.DriverProfileRepository;
import com.example.rhl.domain.pricing.FareQuote;
import com.example.rhl.domain.pricing.FareQuoteRepository;
import com.example.rhl.domain.pricing.PricingService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Service
@RequiredArgsConstructor
@Slf4j
public class TripService {

    private final TripRepository tripRepository;
    private final TripStatusHistoryRepository tripStatusHistoryRepository;
    private final DriverOfferRepository driverOfferRepository;
    private final DriverProfileRepository driverProfileRepository;
    private final FareQuoteRepository fareQuoteRepository;
    private final PricingService pricingService;
    private final MatchingService matchingService;
    private final com.example.rhl.domain.realtime.RealtimeEventPublisher realtimeEventPublisher;

    // Idempotency store for trip creations
    private final Map<String, UUID> idempotencyStore = new ConcurrentHashMap<>();

    @Transactional
    public TripResponseDTO createTrip(CreateTripRequestDTO request, String idempotencyKey) {
        // FR-TRIP-002: Idempotency check
        if (idempotencyKey != null && idempotencyStore.containsKey(idempotencyKey)) {
            UUID existingTripId = idempotencyStore.get(idempotencyKey);
            log.info("Idempotent trip request: returning existing trip {}", existingTripId);
            return getTripById(existingTripId);
        }

        // FR-TRIP-003: Validate FareQuote
        FareQuote quote = pricingService.validateAndGetQuote(request.getQuoteId(), request.getCustomerId());

        // FR-TRIP-007: Check active trip conflict
        List<Trip> customerTrips = tripRepository.findByCustomerIdOrderByCreatedAtDesc(request.getCustomerId());
        boolean hasActiveTrip = customerTrips.stream().anyMatch(t ->
                t.getStatus() == TripStatus.MATCHING ||
                t.getStatus() == TripStatus.ACCEPTED ||
                t.getStatus() == TripStatus.PICKING_UP ||
                t.getStatus() == TripStatus.ARRIVED ||
                t.getStatus() == TripStatus.IN_TRIP
        );
        if (hasActiveTrip) {
            throw ApiException.badRequest("ACTIVE_TRIP_EXISTS", "Customer already has an active trip in progress");
        }

        // Mark quote as used
        quote.setUsed(true);
        fareQuoteRepository.save(quote);

        // Generate unique trip code
        String tripCode = "TRIP-" + System.currentTimeMillis() + "-" + UUID.randomUUID().toString().substring(0, 4).toUpperCase();

        Trip trip = Trip.builder()
                .tripCode(tripCode)
                .serviceType(quote.getServiceType())
                .vehicleType(quote.getVehicleType())
                .customerId(request.getCustomerId())
                .status(TripStatus.MATCHING) // FR-TRIP-006: Moves directly from CREATED to MATCHING
                .pickupLatitude(quote.getPickupLatitude())
                .pickupLongitude(quote.getPickupLongitude())
                .pickupAddress(quote.getPickupAddress())
                .dropoffLatitude(quote.getDropoffLatitude())
                .dropoffLongitude(quote.getDropoffLongitude())
                .dropoffAddress(quote.getDropoffAddress())
                .distanceMeters(quote.getDistanceMeters())
                .durationSeconds(quote.getDurationSeconds())
                .quoteId(quote.getId())
                .estimatedFare(quote.getTotalFare())
                .surgeMultiplier(quote.getSurgeMultiplier())
                .currency(quote.getCurrency())
                .receiverName(request.getReceiverName())
                .receiverPhone(request.getReceiverPhone())
                .packageDescription(request.getPackageDescription())
                .deliveryOtp(quote.getServiceType() == com.example.rhl.domain.pricing.ServiceType.DELIVERY
                        ? String.format("%04d", (int)(Math.random() * 10000))
                        : null)
                .build();

        Trip savedTrip = tripRepository.save(trip);

        // Record status history (FR-TRIP-010)
        recordHistory(savedTrip.getId(), null, TripStatus.MATCHING, request.getCustomerId(), "CUSTOMER", "Trip created", quote.getPickupLatitude(), quote.getPickupLongitude());

        if (idempotencyKey != null) {
            idempotencyStore.put(idempotencyKey, savedTrip.getId());
        }

        // Trigger matching engine
        matchingService.triggerMatching(savedTrip);

        return mapToDTO(savedTrip);
    }

    /**
     * UC-06, FR-MAT-010, FR-MAT-011, BR-002, BR-003:
     * Atomic accept offer and concurrency protection against double assignment.
     */
    @Transactional
    public synchronized DriverOfferDTO acceptOffer(UUID offerId, UUID driverId) {
        DriverOffer offer = driverOfferRepository.findById(offerId)
                .orElseThrow(() -> ApiException.notFound("OFFER_NOT_FOUND", "Offer not found: " + offerId));

        if (!offer.getDriverId().equals(driverId)) {
            throw ApiException.forbidden("OFFER_DRIVER_MISMATCH", "Offer does not belong to driver: " + driverId);
        }

        // FR-MAT-012: Repeat accept for winning offer returns same result
        if (offer.getStatus() == OfferStatus.ACCEPTED) {
            return mapOfferToDTO(offer);
        }

        if (offer.getStatus() != OfferStatus.OFFERED || offer.getExpiresAt().isBefore(Instant.now())) {
            throw ApiException.conflict("OFFER_EXPIRED", "Offer has expired or was already resolved");
        }

        Trip trip = tripRepository.findById(offer.getTripId())
                .orElseThrow(() -> ApiException.notFound("TRIP_NOT_FOUND", "Trip not found: " + offer.getTripId()));

        if (trip.getStatus() != TripStatus.MATCHING) {
            throw ApiException.conflict("TRIP_ALREADY_ASSIGNED", "Trip is no longer matching or already accepted");
        }

        DriverProfile driver = driverProfileRepository.findById(driverId)
                .orElseThrow(() -> ApiException.notFound("DRIVER_NOT_FOUND", "Driver not found: " + driverId));

        if (driver.getAvailabilityStatus() == DriverAvailabilityStatus.BUSY) {
            throw ApiException.conflict("DRIVER_BUSY", "Driver is already busy on another trip");
        }

        Instant now = Instant.now();

        // 1. Assign Driver and Accept Trip (FR-MAT-014)
        trip.setStatus(TripStatus.ACCEPTED);
        trip.setDriverId(driverId);
        trip.setAcceptedAt(now);
        tripRepository.save(trip);

        // 2. Mark Driver as BUSY
        driver.setAvailabilityStatus(DriverAvailabilityStatus.BUSY);
        driverProfileRepository.save(driver);

        // 3. Mark Winning Offer as ACCEPTED
        offer.setStatus(OfferStatus.ACCEPTED);
        offer.setRespondedAt(now);
        driverOfferRepository.save(offer);

        // 4. Cancel all other competing offers for this trip
        List<DriverOffer> competingOffers = driverOfferRepository.findByTripId(trip.getId());
        for (DriverOffer other : competingOffers) {
            if (!other.getId().equals(offer.getId()) && other.getStatus() == OfferStatus.OFFERED) {
                other.setStatus(OfferStatus.EXPIRED);
                driverOfferRepository.save(other);

                // Free up the other driver if they were marked OFFERED
                driverProfileRepository.findById(other.getDriverId()).ifPresent(otherDriver -> {
                    if (otherDriver.getAvailabilityStatus() == DriverAvailabilityStatus.OFFERED) {
                        otherDriver.setAvailabilityStatus(DriverAvailabilityStatus.AVAILABLE);
                        driverProfileRepository.save(otherDriver);
                    }
                });
            }
        }

        recordHistory(trip.getId(), TripStatus.MATCHING, TripStatus.ACCEPTED, driverId, "DRIVER", "Driver accepted offer", null, null);
        realtimeEventPublisher.broadcastTripUpdate(trip.getId(), mapToDTO(trip));
        log.info("Driver {} successfully accepted trip {}", driverId, trip.getTripCode());

        return mapOfferToDTO(offer);
    }

    @Transactional
    public void rejectOffer(UUID offerId, UUID driverId) {
        DriverOffer offer = driverOfferRepository.findById(offerId)
                .orElseThrow(() -> ApiException.notFound("OFFER_NOT_FOUND", "Offer not found: " + offerId));

        if (!offer.getDriverId().equals(driverId)) {
            throw ApiException.forbidden("OFFER_DRIVER_MISMATCH", "Offer does not belong to driver");
        }

        if (offer.getStatus() == OfferStatus.OFFERED) {
            offer.setStatus(OfferStatus.REJECTED);
            offer.setRespondedAt(Instant.now());
            driverOfferRepository.save(offer);

            // Revert driver availability back to AVAILABLE
            driverProfileRepository.findById(driverId).ifPresent(driver -> {
                if (driver.getAvailabilityStatus() == DriverAvailabilityStatus.OFFERED) {
                    driver.setAvailabilityStatus(DriverAvailabilityStatus.AVAILABLE);
                    driverProfileRepository.save(driver);
                }
            });
            log.info("Driver {} rejected offer {}", driverId, offerId);
        }
    }

    /**
     * FR-TRIP-008, Mục 7.1, TBD-08: Strict state machine transitions & Delivery OTP verification.
     */
    @Transactional
    public TripResponseDTO updateTripStatus(UUID tripId, UUID actorId, TripStatus newStatus, Double lat, Double lng, String reason) {
        return updateTripStatus(tripId, actorId, newStatus, lat, lng, reason, null);
    }

    @Transactional
    public TripResponseDTO updateTripStatus(UUID tripId, UUID actorId, TripStatus newStatus, Double lat, Double lng, String reason, String deliveryOtp) {
        Trip trip = tripRepository.findById(tripId)
                .orElseThrow(() -> ApiException.notFound("TRIP_NOT_FOUND", "Trip not found: " + tripId));

        TripStatus oldStatus = trip.getStatus();
        validateStateTransition(oldStatus, newStatus);

        Instant now = Instant.now();
        trip.setStatus(newStatus);

        if (newStatus == TripStatus.PICKING_UP) {
            // driver is on the way to pickup
        } else if (newStatus == TripStatus.ARRIVED) {
            trip.setArrivedPickupAt(now);
        } else if (newStatus == TripStatus.IN_TRIP) {
            trip.setStartedAt(now);
        } else if (newStatus == TripStatus.COMPLETED) {
            // TBD-08: Check delivery OTP if this is a delivery trip
            if (trip.getServiceType() == com.example.rhl.domain.pricing.ServiceType.DELIVERY && trip.getDeliveryOtp() != null) {
                if (deliveryOtp == null || !deliveryOtp.trim().equals(trip.getDeliveryOtp())) {
                    throw ApiException.badRequest("INVALID_DELIVERY_OTP", "Invalid delivery confirmation OTP");
                }
            }

            trip.setCompletedAt(now);
            trip.setFinalFare(trip.getEstimatedFare());

            // Free driver back to AVAILABLE (FR-DRV-013)
            if (trip.getDriverId() != null) {
                driverProfileRepository.findById(trip.getDriverId()).ifPresent(driver -> {
                    driver.setAvailabilityStatus(DriverAvailabilityStatus.AVAILABLE);
                    driverProfileRepository.save(driver);
                });
            }
        }

        Trip updatedTrip = tripRepository.save(trip);
        recordHistory(trip.getId(), oldStatus, newStatus, actorId, "ACTOR", reason != null ? reason : "Status updated to " + newStatus, lat, lng);
        realtimeEventPublisher.broadcastTripUpdate(trip.getId(), mapToDTO(updatedTrip));
        log.info("Trip {} status updated from {} to {}", trip.getTripCode(), oldStatus, newStatus);

        return mapToDTO(updatedTrip);
    }

    @Transactional
    public TripResponseDTO cancelTrip(UUID tripId, UUID actorId, String reason) {
        Trip trip = tripRepository.findById(tripId)
                .orElseThrow(() -> ApiException.notFound("TRIP_NOT_FOUND", "Trip not found: " + tripId));

        if (trip.getStatus() == TripStatus.COMPLETED || trip.getStatus() == TripStatus.CANCELLED) {
            throw ApiException.badRequest("CANNOT_CANCEL", "Trip is already in terminal status: " + trip.getStatus());
        }

        TripStatus oldStatus = trip.getStatus();
        trip.setStatus(TripStatus.CANCELLED);
        trip.setCancelledBy(actorId);
        trip.setCancellationReason(reason);
        trip.setCancelledAt(Instant.now());

        // Free driver if assigned
        if (trip.getDriverId() != null) {
            driverProfileRepository.findById(trip.getDriverId()).ifPresent(driver -> {
                driver.setAvailabilityStatus(DriverAvailabilityStatus.AVAILABLE);
                driverProfileRepository.save(driver);
            });
        }

        Trip saved = tripRepository.save(trip);
        recordHistory(trip.getId(), oldStatus, TripStatus.CANCELLED, actorId, "ACTOR", reason, null, null);
        realtimeEventPublisher.broadcastTripUpdate(trip.getId(), mapToDTO(saved));
        log.info("Trip {} cancelled by {}", trip.getTripCode(), actorId);

        return mapToDTO(saved);
    }

    @Transactional(readOnly = true)
    public TripResponseDTO getTripById(UUID tripId) {
        Trip trip = tripRepository.findById(tripId)
                .orElseThrow(() -> ApiException.notFound("TRIP_NOT_FOUND", "Trip not found: " + tripId));
        return mapToDTO(trip);
    }

    @Transactional(readOnly = true)
    public List<TripResponseDTO> getTripsByCustomer(UUID customerId) {
        return tripRepository.findByCustomerIdOrderByCreatedAtDesc(customerId).stream()
                .map(this::mapToDTO)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<TripResponseDTO> getTripsByDriver(UUID driverId) {
        return tripRepository.findByDriverIdOrderByCreatedAtDesc(driverId).stream()
                .map(this::mapToDTO)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<DriverOfferDTO> getPendingOffersByDriver(UUID driverId) {
        return driverOfferRepository.findByDriverIdAndStatus(driverId, OfferStatus.OFFERED).stream()
                .filter(o -> o.getExpiresAt().isAfter(Instant.now()))
                .map(this::mapOfferToDTO)
                .toList();
    }

    private void validateStateTransition(TripStatus from, TripStatus to) {
        boolean valid = switch (from) {
            case CREATED -> to == TripStatus.MATCHING || to == TripStatus.CANCELLED;
            case MATCHING -> to == TripStatus.ACCEPTED || to == TripStatus.NO_DRIVER || to == TripStatus.CANCELLED;
            case ACCEPTED -> to == TripStatus.PICKING_UP || to == TripStatus.CANCELLED;
            case PICKING_UP -> to == TripStatus.ARRIVED || to == TripStatus.CANCELLED;
            case ARRIVED -> to == TripStatus.IN_TRIP || to == TripStatus.CANCELLED;
            case IN_TRIP -> to == TripStatus.COMPLETED || to == TripStatus.CANCELLED;
            default -> false;
        };

        if (!valid) {
            throw ApiException.badRequest("INVALID_STATUS_TRANSITION",
                    "Cannot transition trip state from " + from + " to " + to);
        }
    }

    private void recordHistory(UUID tripId, TripStatus oldStatus, TripStatus newStatus,
                               UUID actorId, String actorRole, String reason, Double lat, Double lng) {
        TripStatusHistory history = TripStatusHistory.builder()
                .tripId(tripId)
                .oldStatus(oldStatus)
                .newStatus(newStatus)
                .actorId(actorId)
                .actorRole(actorRole)
                .reason(reason)
                .latitude(lat)
                .longitude(lng)
                .createdAt(Instant.now())
                .build();
        tripStatusHistoryRepository.save(history);
    }

    private TripResponseDTO mapToDTO(Trip t) {
        return TripResponseDTO.builder()
                .tripId(t.getId())
                .tripCode(t.getTripCode())
                .serviceType(t.getServiceType())
                .vehicleType(t.getVehicleType())
                .customerId(t.getCustomerId())
                .driverId(t.getDriverId())
                .status(t.getStatus())
                .pickupLatitude(t.getPickupLatitude())
                .pickupLongitude(t.getPickupLongitude())
                .pickupAddress(t.getPickupAddress())
                .dropoffLatitude(t.getDropoffLatitude())
                .dropoffLongitude(t.getDropoffLongitude())
                .dropoffAddress(t.getDropoffAddress())
                .distanceMeters(t.getDistanceMeters())
                .durationSeconds(t.getDurationSeconds())
                .estimatedFare(t.getEstimatedFare())
                .finalFare(t.getFinalFare())
                .surgeMultiplier(t.getSurgeMultiplier())
                .currency(t.getCurrency())
                .receiverName(t.getReceiverName())
                .receiverPhone(t.getReceiverPhone())
                .packageDescription(t.getPackageDescription())
                .cancellationReason(t.getCancellationReason())
                .deliveryOtp(t.getDeliveryOtp())
                .createdAt(t.getCreatedAt())
                .acceptedAt(t.getAcceptedAt())
                .startedAt(t.getStartedAt())
                .completedAt(t.getCompletedAt())
                .cancelledAt(t.getCancelledAt())
                .build();
    }

    private DriverOfferDTO mapOfferToDTO(DriverOffer o) {
        Trip trip = tripRepository.findById(o.getTripId()).orElse(null);
        long remaining = Math.max(0, o.getExpiresAt().getEpochSecond() - Instant.now().getEpochSecond());

        return DriverOfferDTO.builder()
                .offerId(o.getId())
                .tripId(o.getTripId())
                .tripCode(trip != null ? trip.getTripCode() : "")
                .driverId(o.getDriverId())
                .serviceType(trip != null ? trip.getServiceType() : null)
                .vehicleType(trip != null ? trip.getVehicleType() : null)
                .status(o.getStatus())
                .pickupAddress(trip != null ? trip.getPickupAddress() : "")
                .dropoffAddress(trip != null ? trip.getDropoffAddress() : "")
                .distanceMeters(trip != null && trip.getDistanceMeters() != null ? trip.getDistanceMeters() : 0L)
                .durationSeconds(trip != null && trip.getDurationSeconds() != null ? trip.getDurationSeconds() : 0L)
                .estimatedFare(trip != null ? trip.getEstimatedFare() : null)
                .offeredAt(o.getOfferedAt())
                .expiresAt(o.getExpiresAt())
                .remainingSeconds(remaining)
                .build();
    }
}
