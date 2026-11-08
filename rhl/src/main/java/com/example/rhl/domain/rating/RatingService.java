package com.example.rhl.domain.rating;

import com.example.rhl.common.ApiException;
import com.example.rhl.domain.driver.DriverProfile;
import com.example.rhl.domain.driver.DriverProfileRepository;
import com.example.rhl.domain.trip.Trip;
import com.example.rhl.domain.trip.TripRepository;
import com.example.rhl.domain.trip.TripStatus;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class RatingService {

    private final RatingRepository ratingRepository;
    private final TripRepository tripRepository;
    private final DriverProfileRepository driverProfileRepository;

    @Transactional
    public RatingDTO.Response submitRating(UUID tripId, UUID customerId, RatingDTO.CreateRequest request) {
        // FR-RAT-001 & FR-RAT-002
        Trip trip = tripRepository.findById(tripId)
                .orElseThrow(() -> ApiException.notFound("TRIP_NOT_FOUND", "Trip not found: " + tripId));

        if (trip.getStatus() != TripStatus.COMPLETED) {
            throw ApiException.badRequest("TRIP_NOT_COMPLETED", "Can only rate completed trips");
        }

        if (customerId != null && !trip.getCustomerId().equals(customerId)) {
            throw ApiException.forbidden("ACCESS_DENIED", "You can only rate your own trips");
        }

        if (ratingRepository.findByTripId(tripId).isPresent()) {
            throw ApiException.conflict("RATING_ALREADY_EXISTS", "This trip has already been rated");
        }

        if (trip.getDriverId() == null) {
            throw ApiException.badRequest("NO_DRIVER", "Trip does not have an assigned driver");
        }

        Rating rating = Rating.builder()
                .tripId(tripId)
                .customerId(trip.getCustomerId())
                .driverId(trip.getDriverId())
                .score(request.getScore())
                .comment(request.getComment())
                .tags(request.getTags())
                .build();

        Rating saved = ratingRepository.save(rating);

        // FR-RAT-003: Update Driver average rating
        updateDriverAverageRating(trip.getDriverId());

        log.info("Trip {} rated {} stars by customer {}", tripId, request.getScore(), trip.getCustomerId());

        return mapToDTO(saved);
    }

    @Transactional(readOnly = true)
    public List<RatingDTO.Response> getRatingsByDriver(UUID driverId) {
        return ratingRepository.findByDriverIdOrderByCreatedAtDesc(driverId).stream()
                .map(this::mapToDTO)
                .toList();
    }

    @Transactional(readOnly = true)
    public RatingDTO.Response getRatingByTrip(UUID tripId) {
        return ratingRepository.findByTripId(tripId)
                .map(this::mapToDTO)
                .orElseThrow(() -> ApiException.notFound("RATING_NOT_FOUND", "No rating found for trip " + tripId));
    }

    private void updateDriverAverageRating(UUID driverId) {
        Double avg = ratingRepository.findAverageScoreByDriverId(driverId);
        if (avg != null) {
            DriverProfile profile = driverProfileRepository.findById(driverId).orElse(null);
            if (profile != null) {
                double rounded = BigDecimal.valueOf(avg)
                        .setScale(2, RoundingMode.HALF_UP)
                        .doubleValue();
                profile.setRating(rounded);
                driverProfileRepository.save(profile);
                log.info("Driver {} rating updated to {}", driverId, rounded);
            }
        }
    }

    private RatingDTO.Response mapToDTO(Rating r) {
        return RatingDTO.Response.builder()
                .ratingId(r.getId())
                .tripId(r.getTripId())
                .customerId(r.getCustomerId())
                .driverId(r.getDriverId())
                .score(r.getScore())
                .comment(r.getComment())
                .tags(r.getTags())
                .createdAt(r.getCreatedAt())
                .build();
    }
}
