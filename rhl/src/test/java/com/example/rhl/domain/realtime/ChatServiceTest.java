package com.example.rhl.domain.realtime;

import com.example.rhl.common.ApiException;
import com.example.rhl.domain.trip.Trip;
import com.example.rhl.domain.trip.TripRepository;
import com.example.rhl.domain.trip.TripStatus;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.messaging.simp.SimpMessagingTemplate;

import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ChatServiceTest {

    @Mock
    private TripRepository tripRepository;

    @Mock
    private SimpMessagingTemplate messagingTemplate;

    @InjectMocks
    private ChatService chatService;

    private UUID tripId;
    private UUID senderId;
    private Trip trip;

    @BeforeEach
    void setUp() {
        tripId = UUID.randomUUID();
        senderId = UUID.randomUUID();
        trip = Trip.builder()
                .status(TripStatus.PICKING_UP)
                .build();
        trip.setId(tripId);
    }

    @Test
    void testSendMessage_Success() {
        when(tripRepository.findById(tripId)).thenReturn(Optional.of(trip));

        ChatMessageDTO msg = chatService.sendMessage(tripId, senderId, "CUSTOMER", "Tôi đang đứng ở sảnh A");

        assertNotNull(msg);
        assertEquals("Tôi đang đứng ở sảnh A", msg.getContent());
        assertEquals("CUSTOMER", msg.getSenderRole());
        verify(messagingTemplate, times(1)).convertAndSend(eq("/topic/trips/" + tripId + "/chat"), eq(msg));
    }

    @Test
    void testSendMessage_TripCompleted_ThrowsException() {
        trip.setStatus(TripStatus.COMPLETED);
        when(tripRepository.findById(tripId)).thenReturn(Optional.of(trip));

        ApiException ex = assertThrows(ApiException.class, () ->
                chatService.sendMessage(tripId, senderId, "CUSTOMER", "Chào bạn")
        );

        assertEquals("CHAT_CLOSED", ex.getCode());
        verify(messagingTemplate, never()).convertAndSend(anyString(), any(Object.class));
    }
}
