package com.example.rhl.domain.trip;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface TripRepository extends JpaRepository<Trip, UUID> {
    Optional<Trip> findByTripCode(String tripCode);
    List<Trip> findByCustomerIdOrderByCreatedAtDesc(UUID customerId);
    List<Trip> findByDriverIdOrderByCreatedAtDesc(UUID driverId);
    List<Trip> findByStatus(TripStatus status);
}
