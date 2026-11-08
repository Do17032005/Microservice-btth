package com.example.rhl.domain.identity;

import com.example.rhl.domain.user.UserRole;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponseDTO {
    private String accessToken;
    private String refreshToken;
    @Builder.Default
    private String tokenType = "Bearer";
    @Builder.Default
    private long expiresInSeconds = 3600; // 1 hour
    private UUID userId;
    private String fullName;
    private String phoneNumber;
    private String email;
    private UserRole role;
}
