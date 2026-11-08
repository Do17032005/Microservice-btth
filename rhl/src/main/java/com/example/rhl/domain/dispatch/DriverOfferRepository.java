package com.example.rhl.domain.dispatch;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface DriverOfferRepository extends JpaRepository<DriverOffer, UUID> {
    List<DriverOffer> findByTripId(UUID tripId);
    List<DriverOffer> findByDriverIdAndStatus(UUID driverId, OfferStatus status);
}
