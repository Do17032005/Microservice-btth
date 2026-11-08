package com.example.rhl.domain.realtime;

import com.example.rhl.common.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequiredArgsConstructor
public class ChatController {

    private final ChatService chatService;

    /**
     * REST API fallback for sending in-trip messages.
     */
    @PostMapping("/api/v1/trips/{tripId}/chat")
    public ResponseEntity<ApiResponse<ChatMessageDTO>> sendChatMessage(
            @PathVariable UUID tripId,
            @Valid @RequestBody ChatMessageDTO request,
            Authentication authentication) {

        UUID senderId = request.getSenderId();
        if (authentication != null && authentication.getPrincipal() instanceof UUID authUserId) {
            senderId = authUserId;
        }

        ChatMessageDTO result = chatService.sendMessage(
                tripId,
                senderId,
                request.getSenderRole(),
                request.getContent()
        );

        return ResponseEntity.ok(ApiResponse.success(result));
    }

    /**
     * STOMP Message Handler: Client sends to /app/trips/{tripId}/chat
     */
    @MessageMapping("/trips/{tripId}/chat")
    public void handleStompChatMessage(
            @DestinationVariable UUID tripId,
            @Payload ChatMessageDTO message) {

        chatService.sendMessage(
                tripId,
                message.getSenderId(),
                message.getSenderRole(),
                message.getContent()
        );
    }
}
