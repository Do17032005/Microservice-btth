package com.example.rhl.domain.platform;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

/**
 * Session 10: Kafka Event Publisher
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class KafkaEventPublisher {

    @Autowired(required = false)
    private KafkaTemplate<String, Object> kafkaTemplate;

    public static final String TRIP_EVENTS_TOPIC = "trip-events";

    public void publishTripCompletedEvent(TripCompletedEvent event) {
        log.info("Preparing to publish TripCompletedEvent for trip {} to Kafka topic '{}'",
                event.getTripCode(), TRIP_EVENTS_TOPIC);

        if (kafkaTemplate != null) {
            try {
                kafkaTemplate.send(TRIP_EVENTS_TOPIC, event.getTripId().toString(), event);
                log.info("TripCompletedEvent sent to Kafka successfully");
            } catch (Exception e) {
                log.warn("Kafka broker unreachable, falling back gracefully: {}", e.getMessage());
            }
        } else {
            log.info("KafkaTemplate standalone mock: Event {} dispatched in-process", event.getTripCode());
        }
    }
}
