package com.example.rhl.domain.pricing;

import com.example.rhl.common.ApiException;
import com.example.rhl.domain.driver.VehicleType;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PricingServiceTest {

    @Mock
    private PricingRuleRepository pricingRuleRepository;

    @Mock
    private FareQuoteRepository fareQuoteRepository;

    @Mock
    private RoutingService routingService;

    @Mock
    private SurgeService surgeService;

    @InjectMocks
    private PricingService pricingService;

    private PricingRule sampleRule;
    private UUID customerId;

    @BeforeEach
    void setUp() {
        customerId = UUID.randomUUID();
        sampleRule = PricingRule.builder()
                .id(UUID.randomUUID())
                .serviceType(ServiceType.RIDE)
                .vehicleType(VehicleType.MOTORBIKE)
                .region("DEFAULT")
                .baseFare(BigDecimal.valueOf(12000))
                .perKmRate(BigDecimal.valueOf(5000))
                .perMinuteRate(BigDecimal.valueOf(500))
                .minimumFare(BigDecimal.valueOf(15000))
                .currency("VND")
                .version(1)
                .effectiveFrom(Instant.now())
                .active(true)
                .build();
    }

    @Test
    @DisplayName("Should generate accurate fare quote with routing and surge")
    void testGenerateQuoteSuccessfully() {
        QuoteRequestDTO request = QuoteRequestDTO.builder()
                .customerId(customerId)
                .serviceType(ServiceType.RIDE)
                .vehicleType(VehicleType.MOTORBIKE)
                .pickupLatitude(21.0285)
                .pickupLongitude(105.8542)
                .pickupAddress("Hoan Kiem Lake, Hanoi")
                .dropoffLatitude(21.0360)
                .dropoffLongitude(105.8340)
                .dropoffAddress("Ba Dinh Square, Hanoi")
                .build();

        // Distance: 3000m (3km), Duration: 600s (10 mins)
        when(pricingRuleRepository.findFirstByServiceTypeAndVehicleTypeAndRegionAndActiveTrueOrderByVersionDesc(
                ServiceType.RIDE, VehicleType.MOTORBIKE, "DEFAULT"
        )).thenReturn(Optional.of(sampleRule));

        when(routingService.estimateRoute(anyDouble(), anyDouble(), anyDouble(), anyDouble()))
                .thenReturn(new RoutingService.RouteEstimate(3000, 600));

        when(surgeService.calculateSurgeMultiplier(anyDouble(), anyDouble()))
                .thenReturn(BigDecimal.valueOf(1.20));

        when(fareQuoteRepository.save(any(FareQuote.class))).thenAnswer(invocation -> {
            FareQuote q = invocation.getArgument(0);
            q.setId(UUID.randomUUID());
            return q;
        });

        FareQuoteDTO quote = pricingService.generateQuote(request);

        assertNotNull(quote);
        assertEquals(customerId, quote.getCustomerId());
        // Base = 12,000; Distance = 3 * 5,000 = 15,000; Time = 10 * 500 = 5,000
        // Subtotal = 32,000
        // Surge = 32,000 * 1.20 = 38,400 -> Rounded up to nearest 1,000 = 39,000 VND
        assertEquals(BigDecimal.valueOf(39000), quote.getTotalFare());
        assertEquals(BigDecimal.valueOf(1.20), quote.getSurgeMultiplier());
        assertFalse(quote.isExpired());
    }

    @Test
    @DisplayName("Should reject quote if used by another customer (FR-PRI-014)")
    void testValidateQuoteCustomerMismatch() {
        UUID quoteId = UUID.randomUUID();
        UUID otherCustomerId = UUID.randomUUID();

        FareQuote quote = FareQuote.builder()
                .id(quoteId)
                .customerId(customerId)
                .expiresAt(Instant.now().plus(5, ChronoUnit.MINUTES))
                .used(false)
                .build();

        when(fareQuoteRepository.findById(quoteId)).thenReturn(Optional.of(quote));

        ApiException ex = assertThrows(ApiException.class, () ->
                pricingService.validateAndGetQuote(quoteId, otherCustomerId)
        );

        assertEquals("QUOTE_CUSTOMER_MISMATCH", ex.getCode());
    }

    @Test
    @DisplayName("Should reject expired quote (FR-PRI-015)")
    void testValidateExpiredQuote() {
        UUID quoteId = UUID.randomUUID();

        FareQuote expiredQuote = FareQuote.builder()
                .id(quoteId)
                .customerId(customerId)
                .expiresAt(Instant.now().minus(1, ChronoUnit.MINUTES))
                .used(false)
                .build();

        when(fareQuoteRepository.findById(quoteId)).thenReturn(Optional.of(expiredQuote));

        ApiException ex = assertThrows(ApiException.class, () ->
                pricingService.validateAndGetQuote(quoteId, customerId)
        );

        assertEquals("QUOTE_EXPIRED", ex.getCode());
    }
}
