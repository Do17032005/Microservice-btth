package com.example.rhl.domain.realtime;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.time.Instant;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChatMessageDTO {
    private String messageId;
    private UUID tripId;
    private UUID senderId;
    private String senderRole; // CUSTOMER or DRIVER

    @NotBlank(message = "Message content is required")
    @Size(max = 500, message = "Message content cannot exceed 500 characters")
    private String content;

    private Instant sentAt;
}
