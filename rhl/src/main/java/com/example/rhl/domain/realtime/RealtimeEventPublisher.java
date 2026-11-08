package com.example.rhl.domain.realtime;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class RealtimeEventPublisher {

    private final SimpMessagingTemplate messagingTemplate;

    public void broadcastTripUpdate(UUID tripId, Object payload) {
        String destination = "/topic/trips/" + tripId;
        log.info("Broadcasting trip update to {}", destination);
        messagingTemplate.convertAndSend(destination, payload);
    }

    public void broadcastDriverLocation(UUID tripId, double latitude, double longitude) {
        String destination = "/topic/trips/" + tripId + "/location";
        Map<String, Object> message = Map.of(
                "tripId", tripId,
                "latitude", latitude,
                "longitude", longitude,
                "timestamp", Instant.now()
        );
        messagingTemplate.convertAndSend(destination, message);
    }

    public void sendOfferToDriver(UUID driverId, Object offer) {
        String destination = "/topic/drivers/" + driverId + "/offers";
        log.info("Pushing offer to driver on {}", destination);
        messagingTemplate.convertAndSend(destination, offer);
    }
}
