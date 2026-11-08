package com.example.rhl.config.security;

import com.example.rhl.domain.user.User;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Date;
import java.util.UUID;

@Component
@Slf4j
public class JwtUtils {

    // Default 256-bit secure key
    private final SecretKey key = Keys.hmacShaKeyFor(
            "rhl_super_secret_jwt_signing_key_for_ride_hailing_system_2026_safe".getBytes(StandardCharsets.UTF_8)
    );

    private static final long ACCESS_TOKEN_EXPIRATION_MINUTES = 60; // 1 hour
    private static final long REFRESH_TOKEN_EXPIRATION_DAYS = 7;   // 7 days

    public String generateToken(User user) {
        return generateAccessToken(user);
    }

    public String generateAccessToken(User user) {
        Instant now = Instant.now();
        Instant expiry = now.plus(ACCESS_TOKEN_EXPIRATION_MINUTES, ChronoUnit.MINUTES);

        return Jwts.builder()
                .subject(user.getId().toString())
                .claim("phone", user.getPhoneNumber())
                .claim("name", user.getFullName())
                .claim("role", user.getRole().name())
                .claim("type", "ACCESS")
                .issuedAt(Date.from(now))
                .expiration(Date.from(expiry))
                .signWith(key)
                .compact();
    }

    public String generateRefreshToken(User user) {
        Instant now = Instant.now();
        Instant expiry = now.plus(REFRESH_TOKEN_EXPIRATION_DAYS, ChronoUnit.DAYS);

        return Jwts.builder()
                .subject(user.getId().toString())
                .claim("type", "REFRESH")
                .issuedAt(Date.from(now))
                .expiration(Date.from(expiry))
                .signWith(key)
                .compact();
    }

    public boolean validateToken(String token) {
        try {
            Jwts.parser().verifyWith(key).build().parseSignedClaims(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            log.warn("Invalid JWT token: {}", e.getMessage());
            return false;
        }
    }

    public UUID getUserIdFromToken(String token) {
        Claims claims = Jwts.parser().verifyWith(key).build().parseSignedClaims(token).getPayload();
        return UUID.fromString(claims.getSubject());
    }

    public String getRoleFromToken(String token) {
        Claims claims = Jwts.parser().verifyWith(key).build().parseSignedClaims(token).getPayload();
        return claims.get("role", String.class);
    }
}
