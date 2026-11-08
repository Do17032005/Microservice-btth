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
import com.example.rhl.domain.driver.VehicleType;
import com.example.rhl.domain.pricing.FareQuote;
import com.example.rhl.domain.pricing.FareQuoteRepository;
import com.example.rhl.domain.pricing.PricingService;
import com.example.rhl.domain.pricing.ServiceType;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TripServiceTest {

    @Mock
    private TripRepository tripRepository;

    @Mock
    private TripStatusHistoryRepository tripStatusHistoryRepository;

    @Mock
    private DriverOfferRepository driverOfferRepository;

    @Mock
    private DriverProfileRepository driverProfileRepository;

    @Mock
    private FareQuoteRepository fareQuoteRepository;

    @Mock
    private PricingService pricingService;

    @Mock
    private MatchingService matchingService;

    @Mock
    private com.example.rhl.domain.realtime.RealtimeEventPublisher realtimeEventPublisher;

    @InjectMocks
    private TripService tripService;

    private UUID customerId;
    private UUID driverId;
    private UUID quoteId;
    private FareQuote sampleQuote;

    @BeforeEach
    void setUp() {
        customerId = UUID.randomUUID();
        driverId = UUID.randomUUID();
        quoteId = UUID.randomUUID();

        sampleQuote = FareQuote.builder()
                .id(quoteId)
                .customerId(customerId)
                .serviceType(ServiceType.RIDE)
                .vehicleType(VehicleType.MOTORBIKE)
                .pickupLatitude(21.0285)
                .pickupLongitude(105.8542)
                .pickupAddress("Hoan Kiem")
                .dropoffLatitude(21.0360)
                .dropoffLongitude(105.8340)
                .dropoffAddress("Ba Dinh")
                .distanceMeters(3000L)
                .durationSeconds(600L)
                .totalFare(BigDecimal.valueOf(35000))
                .surgeMultiplier(BigDecimal.valueOf(1.00))
                .currency("VND")
                .used(false)
                .expiresAt(Instant.now().plus(5, ChronoUnit.MINUTES))
                .build();
    }

    @Test
    @DisplayName("Should create trip and transition to MATCHING status (FR-TRIP-001, FR-TRIP-006)")
    void testCreateTripSuccess() {
        CreateTripRequestDTO req = CreateTripRequestDTO.builder()
                .customerId(customerId)
                .quoteId(quoteId)
                .build();

        when(pricingService.validateAndGetQuote(quoteId, customerId)).thenReturn(sampleQuote);
        when(tripRepository.findByCustomerIdOrderByCreatedAtDesc(customerId)).thenReturn(Collections.emptyList());
        when(tripRepository.save(any(Trip.class))).thenAnswer(i -> {
            Trip t = i.getArgument(0);
            t.setId(UUID.randomUUID());
            return t;
        });

        TripResponseDTO res = tripService.createTrip(req, "IDEMP-KEY-001");

        assertNotNull(res);
        assertEquals(TripStatus.MATCHING, res.getStatus());
        assertEquals(customerId, res.getCustomerId());
        assertEquals(BigDecimal.valueOf(35000), res.getEstimatedFare());

        // Verify quote is marked as used
        assertTrue(sampleQuote.isUsed());
        verify(matchingService, times(1)).triggerMatching(any(Trip.class));
    }

    @Test
    @DisplayName("UC-06: Atomic offer acceptance must assign driver, mark driver BUSY and expire competitors")
    void testAcceptOfferAtomicAndCancelCompetitors() {
        UUID tripId = UUID.randomUUID();
        UUID offerId = UUID.randomUUID();
        UUID competingOfferId = UUID.randomUUID();
        UUID otherDriverId = UUID.randomUUID();

        Trip trip = Trip.builder()
                .id(tripId)
                .tripCode("TRIP-TEST-123")
                .status(TripStatus.MATCHING)
                .estimatedFare(BigDecimal.valueOf(35000))
                .build();

        DriverOffer winningOffer = DriverOffer.builder()
                .id(offerId)
                .tripId(tripId)
                .driverId(driverId)
                .status(OfferStatus.OFFERED)
                .expiresAt(Instant.now().plusSeconds(10))
                .build();

        DriverOffer competingOffer = DriverOffer.builder()
                .id(competingOfferId)
                .tripId(tripId)
                .driverId(otherDriverId)
                .status(OfferStatus.OFFERED)
                .expiresAt(Instant.now().plusSeconds(10))
                .build();

        DriverProfile winningDriver = DriverProfile.builder()
                .id(driverId)
                .availabilityStatus(DriverAvailabilityStatus.OFFERED)
                .build();

        DriverProfile otherDriver = DriverProfile.builder()
                .id(otherDriverId)
                .availabilityStatus(DriverAvailabilityStatus.OFFERED)
                .build();

        when(driverOfferRepository.findById(offerId)).thenReturn(Optional.of(winningOffer));
        when(tripRepository.findById(tripId)).thenReturn(Optional.of(trip));
        when(driverProfileRepository.findById(driverId)).thenReturn(Optional.of(winningDriver));
        when(driverOfferRepository.findByTripId(tripId)).thenReturn(List.of(winningOffer, competingOffer));
        when(driverProfileRepository.findById(otherDriverId)).thenReturn(Optional.of(otherDriver));

        DriverOfferDTO res = tripService.acceptOffer(offerId, driverId);

        assertNotNull(res);
        assertEquals(OfferStatus.ACCEPTED, winningOffer.getStatus());
        assertEquals(TripStatus.ACCEPTED, trip.getStatus());
        assertEquals(driverId, trip.getDriverId());
        assertEquals(DriverAvailabilityStatus.BUSY, winningDriver.getAvailabilityStatus());

        // Verify competing offer expired and other driver set to AVAILABLE
        assertEquals(OfferStatus.EXPIRED, competingOffer.getStatus());
        assertEquals(DriverAvailabilityStatus.AVAILABLE, otherDriver.getAvailabilityStatus());
    }

    @Test
    @DisplayName("UC-06: Should reject accept offer if trip already assigned")
    void testRejectAcceptIfTripAlreadyAssigned() {
        UUID tripId = UUID.randomUUID();
        UUID offerId = UUID.randomUUID();

        Trip trip = Trip.builder()
                .id(tripId)
                .status(TripStatus.ACCEPTED) // Already accepted
                .build();

        DriverOffer offer = DriverOffer.builder()
                .id(offerId)
                .tripId(tripId)
                .driverId(driverId)
                .status(OfferStatus.OFFERED)
                .expiresAt(Instant.now().plusSeconds(10))
                .build();

        when(driverOfferRepository.findById(offerId)).thenReturn(Optional.of(offer));
        when(tripRepository.findById(tripId)).thenReturn(Optional.of(trip));

        ApiException ex = assertThrows(ApiException.class, () ->
                tripService.acceptOffer(offerId, driverId)
        );

        assertEquals("TRIP_ALREADY_ASSIGNED", ex.getCode());
    }

    @Test
    @DisplayName("State machine: Valid progression ACCEPTED -> PICKING_UP -> ARRIVED -> IN_TRIP -> COMPLETED frees driver")
    void testValidTripProgression() {
        UUID tripId = UUID.randomUUID();

        Trip trip = Trip.builder()
                .id(tripId)
                .tripCode("TRIP-LIFECYCLE-1")
                .status(TripStatus.ACCEPTED)
                .driverId(driverId)
                .estimatedFare(BigDecimal.valueOf(40000))
                .build();

        DriverProfile driver = DriverProfile.builder()
                .id(driverId)
                .availabilityStatus(DriverAvailabilityStatus.BUSY)
                .build();

        when(tripRepository.findById(tripId)).thenReturn(Optional.of(trip));
        when(tripRepository.save(any(Trip.class))).thenAnswer(i -> i.getArgument(0));
        when(driverProfileRepository.findById(driverId)).thenReturn(Optional.of(driver));

        // 1. ACCEPTED -> PICKING_UP
        tripService.updateTripStatus(tripId, driverId, TripStatus.PICKING_UP, 21.0, 105.0, "En route");
        assertEquals(TripStatus.PICKING_UP, trip.getStatus());

        // 2. PICKING_UP -> ARRIVED
        tripService.updateTripStatus(tripId, driverId, TripStatus.ARRIVED, 21.0, 105.0, "Arrived at pickup");
        assertEquals(TripStatus.ARRIVED, trip.getStatus());

        // 3. ARRIVED -> IN_TRIP
        tripService.updateTripStatus(tripId, driverId, TripStatus.IN_TRIP, 21.0, 105.0, "Customer onboard");
        assertEquals(TripStatus.IN_TRIP, trip.getStatus());

        // 4. IN_TRIP -> COMPLETED
        TripResponseDTO completed = tripService.updateTripStatus(tripId, driverId, TripStatus.COMPLETED, 21.0, 105.0, "Arrived at dropoff");
        assertEquals(TripStatus.COMPLETED, completed.getStatus());
        assertEquals(BigDecimal.valueOf(40000), completed.getFinalFare());
        assertEquals(DriverAvailabilityStatus.AVAILABLE, driver.getAvailabilityStatus(), "Driver must be freed back to AVAILABLE");
    }

    @Test
    @DisplayName("State machine: Invalid transition must be rejected")
    void testInvalidTripTransition() {
        UUID tripId = UUID.randomUUID();

        Trip trip = Trip.builder()
                .id(tripId)
                .status(TripStatus.ACCEPTED)
                .build();

        when(tripRepository.findById(tripId)).thenReturn(Optional.of(trip));

        // ACCEPTED cannot jump directly to COMPLETED
        ApiException ex = assertThrows(ApiException.class, () ->
                tripService.updateTripStatus(tripId, driverId, TripStatus.COMPLETED, null, null, null)
        );

        assertEquals("INVALID_STATUS_TRANSITION", ex.getCode());
    }
}
