package com.example.rhl.domain.rating;

import com.example.rhl.common.ApiException;
import com.example.rhl.domain.driver.DriverProfile;
import com.example.rhl.domain.driver.DriverProfileRepository;
import com.example.rhl.domain.trip.Trip;
import com.example.rhl.domain.trip.TripRepository;
import com.example.rhl.domain.trip.TripStatus;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class RatingServiceTest {

    @Mock
    private RatingRepository ratingRepository;

    @Mock
    private TripRepository tripRepository;

    @Mock
    private DriverProfileRepository driverProfileRepository;

    @InjectMocks
    private RatingService ratingService;

    private UUID tripId;
    private UUID customerId;
    private UUID driverId;
    private Trip trip;
    private DriverProfile driverProfile;

    @BeforeEach
    void setUp() {
        tripId = UUID.randomUUID();
        customerId = UUID.randomUUID();
        driverId = UUID.randomUUID();

        trip = Trip.builder()
                .customerId(customerId)
                .driverId(driverId)
                .status(TripStatus.COMPLETED)
                .build();
        trip.setId(tripId);

        driverProfile = DriverProfile.builder()
                .rating(5.0)
                .build();
        driverProfile.setId(driverId);
    }

    @Test
    void testSubmitRating_Success() {
        when(tripRepository.findById(tripId)).thenReturn(Optional.of(trip));
        when(ratingRepository.findByTripId(tripId)).thenReturn(Optional.empty());
        when(ratingRepository.save(any(Rating.class))).thenAnswer(invocation -> {
            Rating r = invocation.getArgument(0);
            r.setId(UUID.randomUUID());
            return r;
        });
        when(ratingRepository.findAverageScoreByDriverId(driverId)).thenReturn(4.5);
        when(driverProfileRepository.findById(driverId)).thenReturn(Optional.of(driverProfile));

        RatingDTO.CreateRequest request = RatingDTO.CreateRequest.builder()
                .score(4)
                .comment("Tài xế đi an toàn, vui vẻ")
                .tags("An toàn, Thân thiện")
                .build();

        RatingDTO.Response response = ratingService.submitRating(tripId, customerId, request);

        assertNotNull(response);
        assertEquals(4, response.getScore());
        assertEquals(tripId, response.getTripId());
        assertEquals(4.5, driverProfile.getRating());
        verify(driverProfileRepository, times(1)).save(driverProfile);
    }

    @Test
    void testSubmitRating_TripNotCompleted_ThrowsException() {
        trip.setStatus(TripStatus.IN_TRIP);
        when(tripRepository.findById(tripId)).thenReturn(Optional.of(trip));

        RatingDTO.CreateRequest request = RatingDTO.CreateRequest.builder()
                .score(5)
                .build();

        ApiException ex = assertThrows(ApiException.class, () ->
                ratingService.submitRating(tripId, customerId, request)
        );
        assertEquals("TRIP_NOT_COMPLETED", ex.getCode());
    }

    @Test
    void testSubmitRating_AlreadyRated_ThrowsConflict() {
        when(tripRepository.findById(tripId)).thenReturn(Optional.of(trip));
        when(ratingRepository.findByTripId(tripId)).thenReturn(Optional.of(new Rating()));

        RatingDTO.CreateRequest request = RatingDTO.CreateRequest.builder()
                .score(5)
                .build();

        ApiException ex = assertThrows(ApiException.class, () ->
                ratingService.submitRating(tripId, customerId, request)
        );
        assertEquals("RATING_ALREADY_EXISTS", ex.getCode());
    }
}
