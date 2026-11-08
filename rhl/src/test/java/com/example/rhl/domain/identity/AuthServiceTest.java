package com.example.rhl.domain.identity;

import com.example.rhl.common.ApiException;
import com.example.rhl.config.security.JwtUtils;
import com.example.rhl.domain.driver.DriverProfile;
import com.example.rhl.domain.driver.DriverProfileRepository;
import com.example.rhl.domain.driver.VehicleRepository;
import com.example.rhl.domain.driver.VehicleType;
import com.example.rhl.domain.user.User;
import com.example.rhl.domain.user.UserRepository;
import com.example.rhl.domain.user.UserRole;
import com.example.rhl.domain.user.UserStatus;
import com.example.rhl.domain.wallet.WalletRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private DriverProfileRepository driverProfileRepository;

    @Mock
    private VehicleRepository vehicleRepository;

    @Mock
    private WalletRepository walletRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtUtils jwtUtils;

    @InjectMocks
    private AuthService authService;

    private User sampleUser;

    @BeforeEach
    void setUp() {
        sampleUser = User.builder()
                .id(UUID.randomUUID())
                .phoneNumber("0909999999")
                .fullName("Test Customer")
                .passwordHash("hashed_password_abc")
                .role(UserRole.CUSTOMER)
                .status(UserStatus.ACTIVE)
                .build();
    }

    @Test
    @DisplayName("Should successfully register customer and return JWT token")
    void testRegisterCustomerSuccess() {
        RegisterRequestDTO req = RegisterRequestDTO.builder()
                .phoneNumber("0909999999")
                .password("secret123")
                .fullName("Test Customer")
                .role(UserRole.CUSTOMER)
                .build();

        when(userRepository.existsByPhoneNumber("0909999999")).thenReturn(false);
        when(passwordEncoder.encode("secret123")).thenReturn("hashed_password_abc");
        when(userRepository.save(any(User.class))).thenReturn(sampleUser);
        when(jwtUtils.generateToken(any(User.class))).thenReturn("mocked.jwt.token");

        AuthResponseDTO res = authService.register(req);

        assertNotNull(res);
        assertEquals("mocked.jwt.token", res.getAccessToken());
        assertEquals("0909999999", res.getPhoneNumber());
        assertEquals(UserRole.CUSTOMER, res.getRole());
        verify(driverProfileRepository, never()).save(any(DriverProfile.class));
    }

    @Test
    @DisplayName("Should successfully register driver with vehicle and wallet")
    void testRegisterDriverSuccess() {
        User driverUser = User.builder()
                .id(UUID.randomUUID())
                .phoneNumber("0908888888")
                .fullName("Test Driver")
                .passwordHash("hashed_password_xyz")
                .role(UserRole.DRIVER)
                .status(UserStatus.ACTIVE)
                .build();

        RegisterRequestDTO req = RegisterRequestDTO.builder()
                .phoneNumber("0908888888")
                .password("secret123")
                .fullName("Test Driver")
                .role(UserRole.DRIVER)
                .vehicleType(VehicleType.CAR_4_SEATS)
                .plateNumber("30A-999.99")
                .vehicleModel("Toyota Vios")
                .build();

        when(userRepository.existsByPhoneNumber("0908888888")).thenReturn(false);
        when(passwordEncoder.encode("secret123")).thenReturn("hashed_password_xyz");
        when(userRepository.save(any(User.class))).thenReturn(driverUser);
        when(driverProfileRepository.save(any(DriverProfile.class))).thenAnswer(i -> i.getArgument(0));
        when(jwtUtils.generateToken(any(User.class))).thenReturn("mocked.driver.token");

        AuthResponseDTO res = authService.register(req);

        assertNotNull(res);
        assertEquals("mocked.driver.token", res.getAccessToken());
        verify(driverProfileRepository, times(1)).save(any(DriverProfile.class));
        verify(vehicleRepository, times(1)).save(any());
        verify(walletRepository, times(1)).save(any());
    }

    @Test
    @DisplayName("Should reject registration if phone number already exists")
    void testRegisterDuplicatePhone() {
        RegisterRequestDTO req = RegisterRequestDTO.builder()
                .phoneNumber("0909999999")
                .password("secret123")
                .fullName("Test Customer")
                .role(UserRole.CUSTOMER)
                .build();

        when(userRepository.existsByPhoneNumber("0909999999")).thenReturn(true);

        ApiException ex = assertThrows(ApiException.class, () -> authService.register(req));
        assertEquals("PHONE_ALREADY_EXISTS", ex.getCode());
    }

    @Test
    @DisplayName("Should login successfully with correct credentials")
    void testLoginSuccess() {
        LoginRequestDTO req = LoginRequestDTO.builder()
                .phoneNumber("0909999999")
                .password("secret123")
                .build();

        when(userRepository.findByPhoneNumber("0909999999")).thenReturn(Optional.of(sampleUser));
        when(passwordEncoder.matches("secret123", "hashed_password_abc")).thenReturn(true);
        when(jwtUtils.generateToken(sampleUser)).thenReturn("mocked.jwt.token");

        AuthResponseDTO res = authService.login(req);

        assertNotNull(res);
        assertEquals("mocked.jwt.token", res.getAccessToken());
    }

    @Test
    @DisplayName("Should reject login with invalid password (FR-IAM-006)")
    void testLoginInvalidPassword() {
        LoginRequestDTO req = LoginRequestDTO.builder()
                .phoneNumber("0909999999")
                .password("wrongpassword")
                .build();

        when(userRepository.findByPhoneNumber("0909999999")).thenReturn(Optional.of(sampleUser));
        when(passwordEncoder.matches("wrongpassword", "hashed_password_abc")).thenReturn(false);

        ApiException ex = assertThrows(ApiException.class, () -> authService.login(req));
        assertEquals("INVALID_CREDENTIALS", ex.getCode());
    }
}
