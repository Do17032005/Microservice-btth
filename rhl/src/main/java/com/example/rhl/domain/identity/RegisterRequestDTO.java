package com.example.rhl.domain.identity;

import com.example.rhl.domain.driver.VehicleType;
import com.example.rhl.domain.user.UserRole;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RegisterRequestDTO {

    @NotBlank(message = "Phone number is required")
    private String phoneNumber;

    @NotBlank(message = "Password is required")
    @Size(min = 6, message = "Password must be at least 6 characters")
    private String password;

    @NotBlank(message = "Full name is required")
    private String fullName;

    private String email;

    @NotNull(message = "Role is required")
    private UserRole role;

    // Optional fields for Driver registration
    private VehicleType vehicleType;
    private String plateNumber;
    private String vehicleModel;
}
