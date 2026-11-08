package com.example.rhl.domain.pricing;

import com.example.rhl.domain.driver.VehicleType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface PricingRuleRepository extends JpaRepository<PricingRule, UUID> {
    Optional<PricingRule> findFirstByServiceTypeAndVehicleTypeAndRegionAndActiveTrueOrderByVersionDesc(
            ServiceType serviceType, VehicleType vehicleType, String region);
}
