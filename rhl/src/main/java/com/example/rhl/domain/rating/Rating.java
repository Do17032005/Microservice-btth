package com.example.rhl.domain.rating;

import com.example.rhl.common.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

@Entity
@Table(name = "ratings", indexes = {
    @Index(name = "idx_rating_trip_id", columnList = "trip_id", unique = true),
    @Index(name = "idx_rating_driver_id", columnList = "driver_id"),
    @Index(name = "idx_rating_customer_id", columnList = "customer_id")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Rating extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "trip_id", nullable = false, unique = true)
    private UUID tripId;

    @Column(name = "customer_id", nullable = false)
    private UUID customerId;

    @Column(name = "driver_id", nullable = false)
    private UUID driverId;

    @Column(name = "score", nullable = false)
    private Integer score; // 1 to 5

    @Column(name = "comment", length = 500)
    private String comment;

    @Column(name = "tags", length = 255)
    private String tags; // e.g. "Lái xe an toàn, Xe sạch sẽ"
}
