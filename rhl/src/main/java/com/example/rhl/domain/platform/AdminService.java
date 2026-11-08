package com.example.rhl.domain.platform;

import com.example.rhl.common.ApiException;
import com.example.rhl.domain.driver.*;
import com.example.rhl.domain.pricing.PricingRule;
import com.example.rhl.domain.pricing.PricingRuleRepository;
import com.example.rhl.domain.trip.Trip;
import com.example.rhl.domain.trip.TripRepository;
import com.example.rhl.domain.trip.TripResponseDTO;
import com.example.rhl.domain.trip.TripStatus;
import com.example.rhl.domain.user.User;
import com.example.rhl.domain.user.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class AdminService {

    private final DriverProfileRepository driverProfileRepository;
    private final VehicleRepository vehicleRepository;
    private final UserRepository userRepository;
    private final TripRepository tripRepository;
    private final PricingRuleRepository pricingRuleRepository;

    @Transactional(readOnly = true)
    public List<DriverAdminDTO.DetailResponse> getPendingDrivers() {
        return driverProfileRepository.findByReviewStatus(DriverReviewStatus.PENDING_REVIEW).stream()
                .map(this::mapDriverToDetail)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<DriverAdminDTO.DetailResponse> getAllDrivers() {
        return driverProfileRepository.findAll().stream()
                .map(this::mapDriverToDetail)
                .toList();
    }

    @Transactional
    public DriverAdminDTO.DetailResponse reviewDriver(UUID driverId, UUID reviewerId, DriverAdminDTO.ReviewRequest request) {
        DriverProfile profile = driverProfileRepository.findById(driverId)
                .orElseThrow(() -> ApiException.notFound("DRIVER_NOT_FOUND", "Driver profile not found: " + driverId));

        if (request.getReviewStatus() == DriverReviewStatus.APPROVED) {
            profile.setReviewStatus(DriverReviewStatus.APPROVED);
            profile.setApprovedBy(reviewerId);
            profile.setApprovedAt(Instant.now());
            profile.setRejectionReason(null);
            // Default to available once approved if was draft
            if (profile.getAvailabilityStatus() == DriverAvailabilityStatus.OFFLINE) {
                profile.setAvailabilityStatus(DriverAvailabilityStatus.AVAILABLE);
            }
            log.info("Driver {} approved by reviewer {}", driverId, reviewerId);
        } else if (request.getReviewStatus() == DriverReviewStatus.REJECTED) {
            profile.setReviewStatus(DriverReviewStatus.REJECTED);
            profile.setRejectionReason(request.getRejectionReason());
            profile.setAvailabilityStatus(DriverAvailabilityStatus.OFFLINE);
            log.info("Driver {} rejected by reviewer {}. Reason: {}", driverId, reviewerId, request.getRejectionReason());
        } else {
            profile.setReviewStatus(request.getReviewStatus());
        }

        DriverProfile updated = driverProfileRepository.save(profile);
        return mapDriverToDetail(updated);
    }

    @Transactional(readOnly = true)
    public List<TripResponseDTO> getAllTrips(TripStatus status) {
        List<Trip> trips;
        if (status != null) {
            trips = tripRepository.findByStatus(status);
        } else {
            trips = tripRepository.findAll();
        }

        return trips.stream()
                .map(t -> TripResponseDTO.builder()
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
                        .build())
                .toList();
    }

    @Transactional(readOnly = true)
    public List<PricingRule> getAllPricingRules() {
        return pricingRuleRepository.findAll();
    }

    private DriverAdminDTO.DetailResponse mapDriverToDetail(DriverProfile p) {
        User user = userRepository.findById(p.getId()).orElse(null);
        Vehicle vehicle = vehicleRepository.findByDriverId(p.getId()).stream().findFirst().orElse(null);

        return DriverAdminDTO.DetailResponse.builder()
                .driverId(p.getId())
                .fullName(user != null ? user.getFullName() : "")
                .phoneNumber(user != null ? user.getPhoneNumber() : "")
                .licenseNumber(p.getLicenseNumber())
                .reviewStatus(p.getReviewStatus())
                .availabilityStatus(p.getAvailabilityStatus())
                .rating(p.getRating())
                .vehiclePlate(vehicle != null ? vehicle.getPlateNumber() : null)
                .vehicleType(vehicle != null ? vehicle.getVehicleType() : null)
                .vehicleModel(vehicle != null ? vehicle.getModel() : null)
                .rejectionReason(p.getRejectionReason())
                .approvedAt(p.getApprovedAt())
                .createdAt(p.getCreatedAt())
                .build();
    }
}
