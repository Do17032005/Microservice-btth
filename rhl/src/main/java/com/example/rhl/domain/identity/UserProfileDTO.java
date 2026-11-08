package com.example.rhl.domain.identity;

import com.example.rhl.domain.user.UserRole;
import com.example.rhl.domain.user.UserStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserProfileDTO {
    private UUID userId;
    private String fullName;
    private String phoneNumber;
    private String email;
    private UserRole role;
    private UserStatus status;
}
