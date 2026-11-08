package com.example.rhl.domain.driver;

import com.example.rhl.common.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

@Entity
@Table(name = "vehicles", indexes = {
    @Index(name = "idx_vehicles_driver", columnList = "driver_id"),
    @Index(name = "idx_vehicles_plate", columnList = "plate_number", unique = true)
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Vehicle extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "vehicle_id", updatable = false, nullable = false)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "driver_id", nullable = false)
    private DriverProfile driver;

    @Enumerated(EnumType.STRING)
    @Column(name = "vehicle_type", length = 30, nullable = false)
    private VehicleType vehicleType;

    @Column(name = "plate_number", length = 20, unique = true, nullable = false)
    private String plateNumber;

    @Column(name = "brand", length = 50)
    private String brand;

    @Column(name = "model", length = 50)
    private String model;

    @Column(name = "color", length = 30)
    private String color;

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private boolean active = true;
}
