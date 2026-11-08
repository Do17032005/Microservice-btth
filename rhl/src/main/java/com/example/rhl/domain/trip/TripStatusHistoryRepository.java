package com.example.rhl.domain.trip;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface TripStatusHistoryRepository extends JpaRepository<TripStatusHistory, UUID> {
    List<TripStatusHistory> findByTripIdOrderByCreatedAtAsc(UUID tripId);
}
