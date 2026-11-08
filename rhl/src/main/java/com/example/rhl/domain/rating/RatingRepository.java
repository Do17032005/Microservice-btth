package com.example.rhl.domain.rating;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface RatingRepository extends JpaRepository<Rating, UUID> {
    Optional<Rating> findByTripId(UUID tripId);
    List<Rating> findByDriverIdOrderByCreatedAtDesc(UUID driverId);

    @Query("SELECT AVG(r.score) FROM Rating r WHERE r.driverId = :driverId")
    Double findAverageScoreByDriverId(@Param("driverId") UUID driverId);

    long countByDriverId(UUID driverId);
}
