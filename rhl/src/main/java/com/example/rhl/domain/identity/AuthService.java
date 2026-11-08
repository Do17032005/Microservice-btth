package com.example.rhl.domain.identity;

import com.example.rhl.common.ApiException;
import com.example.rhl.config.security.JwtUtils;
import com.example.rhl.domain.driver.*;
import com.example.rhl.domain.user.*;
import com.example.rhl.domain.wallet.Wallet;
import com.example.rhl.domain.wallet.WalletRepository;
import com.example.rhl.domain.wallet.WalletStatus;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

    private final UserRepository userRepository;
    private final DriverProfileRepository driverProfileRepository;
    private final VehicleRepository vehicleRepository;
    private final WalletRepository walletRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtils jwtUtils;

    @Transactional
    public AuthResponseDTO register(RegisterRequestDTO request) {
        // FR-IAM-002: Phone number uniqueness
        if (userRepository.existsByPhoneNumber(request.getPhoneNumber())) {
            throw ApiException.badRequest("PHONE_ALREADY_EXISTS", "Phone number is already registered: " + request.getPhoneNumber());
        }

        // FR-IAM-003, NFR-SEC-002: BCrypt password hashing
        User user = User.builder()
                .phoneNumber(request.getPhoneNumber())
                .email(request.getEmail())
                .fullName(request.getFullName())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .role(request.getRole())
                .status(UserStatus.ACTIVE)
                .build();

        User savedUser = userRepository.save(user);

        // If DRIVER, initialize driver profile, vehicle, and wallet
        if (request.getRole() == UserRole.DRIVER) {
            DriverProfile profile = driverProfileRepository.save(DriverProfile.builder()
                    .id(savedUser.getId())
                    .user(savedUser)
                    .licenseNumber("GPLX-" + request.getPhoneNumber())
                    .reviewStatus(DriverReviewStatus.APPROVED)
                    .availabilityStatus(DriverAvailabilityStatus.AVAILABLE)
                    .approvedAt(Instant.now())
                    .rating(5.0)
                    .build());

            VehicleType vType = request.getVehicleType() != null ? request.getVehicleType() : VehicleType.MOTORBIKE;
            String plate = request.getPlateNumber() != null ? request.getPlateNumber() : "29X-" + request.getPhoneNumber().substring(request.getPhoneNumber().length() - 4);
            String model = request.getVehicleModel() != null ? request.getVehicleModel() : "Honda Wave";

            vehicleRepository.save(Vehicle.builder()
                    .driver(profile)
                    .vehicleType(vType)
                    .plateNumber(plate)
                    .brand(model.split(" ")[0])
                    .model(model)
                    .active(true)
                    .build());

            walletRepository.save(Wallet.builder()
                    .driverId(savedUser.getId())
                    .currency("VND")
                    .balance(BigDecimal.valueOf(100000)) // Free 100k bonus
                    .status(WalletStatus.ACTIVE)
                    .build());
        }

        String token = jwtUtils.generateToken(savedUser);
        log.info("User registered successfully: {} ({})", savedUser.getPhoneNumber(), savedUser.getRole());

        return mapToAuthResponse(savedUser, token);
    }

    @Transactional(readOnly = true)
    public AuthResponseDTO login(LoginRequestDTO request) {
        // FR-IAM-005: Login with phone number
        User user = userRepository.findByPhoneNumber(request.getPhoneNumber())
                .orElseThrow(() -> ApiException.badRequest("INVALID_CREDENTIALS", "Invalid phone number or password"));

        // FR-IAM-003, FR-IAM-006: Password verification
        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw ApiException.badRequest("INVALID_CREDENTIALS", "Invalid phone number or password");
        }

        if (user.getStatus() != UserStatus.ACTIVE) {
            throw ApiException.forbidden("ACCOUNT_LOCKED", "Account is suspended or inactive");
        }

        String token = jwtUtils.generateToken(user);
        log.info("User logged in successfully: {} ({})", user.getPhoneNumber(), user.getRole());

        return mapToAuthResponse(user, token);
    }

    @Transactional(readOnly = true)
    public UserProfileDTO getProfile(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> ApiException.notFound("USER_NOT_FOUND", "User not found: " + userId));

        return UserProfileDTO.builder()
                .userId(user.getId())
                .fullName(user.getFullName())
                .phoneNumber(user.getPhoneNumber())
                .email(user.getEmail())
                .role(user.getRole())
                .status(user.getStatus())
                .build();
    }

    public AuthResponseDTO refreshToken(String refreshToken) {
        if (!jwtUtils.validateToken(refreshToken)) {
            throw ApiException.badRequest("INVALID_REFRESH_TOKEN", "Refresh token is invalid or expired");
        }

        UUID userId = jwtUtils.getUserIdFromToken(refreshToken);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> ApiException.notFound("USER_NOT_FOUND", "User not found"));

        if (user.getStatus() != UserStatus.ACTIVE) {
            throw ApiException.forbidden("ACCOUNT_LOCKED", "Account is suspended or inactive");
        }

        log.info("Token refreshed successfully for user: {}", user.getPhoneNumber());
        return mapToAuthResponse(user);
    }

    private AuthResponseDTO mapToAuthResponse(User u, String token) {
        String accessToken = token != null ? token : jwtUtils.generateAccessToken(u);
        String refreshToken = jwtUtils.generateRefreshToken(u);

        return AuthResponseDTO.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .tokenType("Bearer")
                .expiresInSeconds(3600)
                .userId(u.getId())
                .fullName(u.getFullName())
                .phoneNumber(u.getPhoneNumber())
                .email(u.getEmail())
                .role(u.getRole())
                .build();
    }

    private AuthResponseDTO mapToAuthResponse(User u) {
        return mapToAuthResponse(u, null);
    }
}
