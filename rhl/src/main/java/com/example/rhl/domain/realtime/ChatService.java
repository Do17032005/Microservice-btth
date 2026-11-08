package com.example.rhl.domain.realtime;

import com.example.rhl.common.ApiException;
import com.example.rhl.domain.trip.Trip;
import com.example.rhl.domain.trip.TripRepository;
import com.example.rhl.domain.trip.TripStatus;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class ChatService {

    private final TripRepository tripRepository;
    private final SimpMessagingTemplate messagingTemplate;

    public ChatMessageDTO sendMessage(UUID tripId, UUID senderId, String senderRole, String content) {
        // FR-COM-001 & FR-COM-002: Only allowed during active in-trip stages
        Trip trip = tripRepository.findById(tripId)
                .orElseThrow(() -> ApiException.notFound("TRIP_NOT_FOUND", "Trip not found: " + tripId));

        TripStatus status = trip.getStatus();
        if (status == TripStatus.COMPLETED || status == TripStatus.CANCELLED || status == TripStatus.NO_DRIVER) {
            throw ApiException.badRequest("CHAT_CLOSED", "In-trip chat is closed for status: " + status);
        }

        if (status == TripStatus.CREATED || status == TripStatus.MATCHING) {
            throw ApiException.badRequest("CHAT_NOT_READY", "Chat is only available once a driver has accepted the trip");
        }

        ChatMessageDTO message = ChatMessageDTO.builder()
                .messageId("msg_" + UUID.randomUUID())
                .tripId(tripId)
                .senderId(senderId)
                .senderRole(senderRole != null ? senderRole : "USER")
                .content(content)
                .sentAt(Instant.now())
                .build();

        String destination = "/topic/trips/" + tripId + "/chat";
        messagingTemplate.convertAndSend(destination, message);
        log.info("Broadcasted chat message {} to destination {}", message.getMessageId(), destination);

        return message;
    }
}
