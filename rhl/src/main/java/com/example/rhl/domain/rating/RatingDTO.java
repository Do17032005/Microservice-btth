package com.example.rhl.domain.rating;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.time.Instant;
import java.util.UUID;

public class RatingDTO {

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class CreateRequest {
        @NotNull(message = "Score is required")
        @Min(value = 1, message = "Score must be at least 1")
        @Max(value = 5, message = "Score must be at most 5")
        private Integer score;

        @Size(max = 500, message = "Comment must not exceed 500 characters")
        private String comment;

        private String tags;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class Response {
        private UUID ratingId;
        private UUID tripId;
        private UUID customerId;
        private UUID driverId;
        private Integer score;
        private String comment;
        private String tags;
        private Instant createdAt;
    }
}
