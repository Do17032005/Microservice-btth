package com.example.rhl.domain.platform;

import com.example.rhl.domain.driver.*;
import com.example.rhl.domain.pricing.PricingRuleRepository;
import com.example.rhl.domain.trip.TripRepository;
import com.example.rhl.domain.user.UserRepository;
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
class AdminServiceTest {

    @Mock
    private DriverProfileRepository driverProfileRepository;
    @Mock
    private VehicleRepository vehicleRepository;
    @Mock
    private UserRepository userRepository;
    @Mock
    private TripRepository tripRepository;
    @Mock
    private PricingRuleRepository pricingRuleRepository;

    @InjectMocks
    private AdminService adminService;

    private UUID driverId;
    private UUID reviewerId;
    private DriverProfile driverProfile;

    @BeforeEach
    void setUp() {
        driverId = UUID.randomUUID();
        reviewerId = UUID.randomUUID();
        driverProfile = DriverProfile.builder()
                .licenseNumber("29A1-12345")
                .reviewStatus(DriverReviewStatus.PENDING_REVIEW)
                .availabilityStatus(DriverAvailabilityStatus.OFFLINE)
                .rating(5.0)
                .build();
        driverProfile.setId(driverId);
    }

    @Test
    void testReviewDriver_Approve() {
        when(driverProfileRepository.findById(driverId)).thenReturn(Optional.of(driverProfile));
        when(driverProfileRepository.save(any(DriverProfile.class))).thenReturn(driverProfile);

        DriverAdminDTO.ReviewRequest req = DriverAdminDTO.ReviewRequest.builder()
                .reviewStatus(DriverReviewStatus.APPROVED)
                .build();

        DriverAdminDTO.DetailResponse resp = adminService.reviewDriver(driverId, reviewerId, req);

        assertNotNull(resp);
        assertEquals(DriverReviewStatus.APPROVED, driverProfile.getReviewStatus());
        assertEquals(DriverAvailabilityStatus.AVAILABLE, driverProfile.getAvailabilityStatus());
        assertEquals(reviewerId, driverProfile.getApprovedBy());
    }

    @Test
    void testReviewDriver_Reject() {
        when(driverProfileRepository.findById(driverId)).thenReturn(Optional.of(driverProfile));
        when(driverProfileRepository.save(any(DriverProfile.class))).thenReturn(driverProfile);

        DriverAdminDTO.ReviewRequest req = DriverAdminDTO.ReviewRequest.builder()
                .reviewStatus(DriverReviewStatus.REJECTED)
                .rejectionReason("Ảnh bằng lái xe bị mờ")
                .build();

        DriverAdminDTO.DetailResponse resp = adminService.reviewDriver(driverId, reviewerId, req);

        assertNotNull(resp);
        assertEquals(DriverReviewStatus.REJECTED, driverProfile.getReviewStatus());
        assertEquals("Ảnh bằng lái xe bị mờ", driverProfile.getRejectionReason());
    }
}
