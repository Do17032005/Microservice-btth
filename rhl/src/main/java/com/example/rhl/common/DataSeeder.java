package com.example.rhl.common;

import com.example.rhl.domain.driver.*;
import com.example.rhl.domain.location.LocationService;
import com.example.rhl.domain.pricing.PricingRule;
import com.example.rhl.domain.pricing.PricingRuleRepository;
import com.example.rhl.domain.pricing.ServiceType;
import com.example.rhl.domain.user.User;
import com.example.rhl.domain.user.UserRepository;
import com.example.rhl.domain.user.UserRole;
import com.example.rhl.domain.user.UserStatus;
import com.example.rhl.domain.wallet.Wallet;
import com.example.rhl.domain.wallet.WalletRepository;
import com.example.rhl.domain.wallet.WalletStatus;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final DriverProfileRepository driverProfileRepository;
    private final VehicleRepository vehicleRepository;
    private final PricingRuleRepository pricingRuleRepository;
    private final WalletRepository walletRepository;
    private final LocationService locationService;
    private final org.springframework.security.crypto.password.PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) {
        if (userRepository.count() > 0) {
            log.info("Database already seeded. Skipping initial data load.");
            return;
        }

        log.info("--- START SEEDING SAMPLE DATA (SRS-RHL-002) ---");

        String defaultHashedPassword = passwordEncoder.encode("123456");

        // 1. Admin
        userRepository.save(User.builder()
                .phoneNumber("0900000000")
                .email("admin@rhl.com")
                .fullName("System Administrator")
                .passwordHash(defaultHashedPassword)
                .role(UserRole.ADMIN)
                .status(UserStatus.ACTIVE)
                .build());

        // 2. Customers
        User customer1 = userRepository.save(User.builder()
                .phoneNumber("0901234567")
                .email("customer1@gmail.com")
                .fullName("Nguyen Van A (Customer)")
                .passwordHash(defaultHashedPassword)
                .role(UserRole.CUSTOMER)
                .status(UserStatus.ACTIVE)
                .build());

        User customer2 = userRepository.save(User.builder()
                .phoneNumber("0902345678")
                .email("customer2@gmail.com")
                .fullName("Tran Thi B (Customer)")
                .passwordHash(defaultHashedPassword)
                .role(UserRole.CUSTOMER)
                .status(UserStatus.ACTIVE)
                .build());

        // 3. Drivers with Vehicles and Wallets
        seedDriver("0903000001", "driver1@gmail.com", "Le Van Tài Xế 1",
                VehicleType.MOTORBIKE, "29A-111.11", "Honda Wave", "Đỏ",
                21.0290, 105.8550, defaultHashedPassword);

        seedDriver("0903000002", "driver2@gmail.com", "Pham Van Tài Xế 2",
                VehicleType.CAR_4_SEATS, "30E-222.22", "Toyota Vios", "Trắng",
                21.0320, 105.8500, defaultHashedPassword);

        seedDriver("0903000003", "driver3@gmail.com", "Hoang Van Tài Xế 3",
                VehicleType.CAR_7_SEATS, "51F-333.33", "Mitsubishi Xpander", "Bạc",
                21.0250, 105.8600, defaultHashedPassword);

        seedDriver("0903000004", "driver4@gmail.com", "Vu Van Tài Xế 4",
                VehicleType.MOTORBIKE, "43D-444.44", "Yamaha Exciter", "Xanh",
                21.0100, 105.8400, defaultHashedPassword);

        // 4. Pricing Rules
        seedPricingRules();

        log.info("--- COMPLETED SEEDING SAMPLE DATA ---");
    }

    private void seedDriver(String phone, String email, String name,
                            VehicleType vType, String plate, String model, String color,
                            double lat, double lng, String defaultPassword) {

        User driverUser = userRepository.save(User.builder()
                .phoneNumber(phone)
                .email(email)
                .fullName(name)
                .passwordHash(defaultPassword)
                .role(UserRole.DRIVER)
                .status(UserStatus.ACTIVE)
                .build());

        DriverProfile profile = driverProfileRepository.save(DriverProfile.builder()
                .id(driverUser.getId())
                .user(driverUser)
                .licenseNumber("GPLX-" + phone)
                .reviewStatus(DriverReviewStatus.APPROVED)
                .availabilityStatus(DriverAvailabilityStatus.AVAILABLE)
                .approvedAt(Instant.now())
                .rating(4.9)
                .build());

        vehicleRepository.save(Vehicle.builder()
                .driver(profile)
                .vehicleType(vType)
                .plateNumber(plate)
                .brand(model.split(" ")[0])
                .model(model)
                .color(color)
                .active(true)
                .build());

        walletRepository.save(Wallet.builder()
                .driverId(profile.getId())
                .currency("VND")
                .balance(BigDecimal.valueOf(500000)) // Initial 500k VND
                .status(WalletStatus.ACTIVE)
                .build());

        // Update initial location into Spatial Index
        locationService.updateTelemetry(profile.getId(), lat, lng, 10.0);
    }

    private void seedPricingRules() {
        pricingRuleRepository.save(PricingRule.builder()
                .serviceType(ServiceType.RIDE)
                .vehicleType(VehicleType.MOTORBIKE)
                .region("DEFAULT")
                .baseFare(BigDecimal.valueOf(12000))
                .perKmRate(BigDecimal.valueOf(5000))
                .perMinuteRate(BigDecimal.valueOf(500))
                .minimumFare(BigDecimal.valueOf(15000))
                .cancellationFee(BigDecimal.valueOf(10000))
                .currency("VND")
                .version(1)
                .effectiveFrom(Instant.now())
                .active(true)
                .build());

        pricingRuleRepository.save(PricingRule.builder()
                .serviceType(ServiceType.RIDE)
                .vehicleType(VehicleType.CAR_4_SEATS)
                .region("DEFAULT")
                .baseFare(BigDecimal.valueOf(20000))
                .perKmRate(BigDecimal.valueOf(10000))
                .perMinuteRate(BigDecimal.valueOf(1000))
                .minimumFare(BigDecimal.valueOf(25000))
                .cancellationFee(BigDecimal.valueOf(15000))
                .currency("VND")
                .version(1)
                .effectiveFrom(Instant.now())
                .active(true)
                .build());

        pricingRuleRepository.save(PricingRule.builder()
                .serviceType(ServiceType.DELIVERY)
                .vehicleType(VehicleType.MOTORBIKE)
                .region("DEFAULT")
                .baseFare(BigDecimal.valueOf(15000))
                .perKmRate(BigDecimal.valueOf(6000))
                .perMinuteRate(BigDecimal.valueOf(500))
                .minimumFare(BigDecimal.valueOf(20000))
                .cancellationFee(BigDecimal.valueOf(10000))
                .currency("VND")
                .version(1)
                .effectiveFrom(Instant.now())
                .active(true)
                .build());
    }
}
