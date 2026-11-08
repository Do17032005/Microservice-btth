package com.example.rhl.domain.driver;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface DriverProfileRepository extends JpaRepository<DriverProfile, UUID> {
    Optional<DriverProfile> findByLicenseNumber(String licenseNumber);
    java.util.List<DriverProfile> findByReviewStatus(DriverReviewStatus reviewStatus);
}
