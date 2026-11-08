package com.example.rhl.domain.pricing;

import com.example.rhl.common.ApiException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class PricingService {

    private final PricingRuleRepository pricingRuleRepository;
    private final FareQuoteRepository fareQuoteRepository;
    private final RoutingService routingService;
    private final SurgeService surgeService;

    private static final int QUOTE_VALIDITY_MINUTES = 5;

    @Transactional
    public FareQuoteDTO generateQuote(QuoteRequestDTO request) {
        validateCoordinates(request.getPickupLatitude(), request.getPickupLongitude());
        validateCoordinates(request.getDropoffLatitude(), request.getDropoffLongitude());

        // 1. Fetch active pricing rule (FR-PRI-001)
        PricingRule rule = pricingRuleRepository
                .findFirstByServiceTypeAndVehicleTypeAndRegionAndActiveTrueOrderByVersionDesc(
                        request.getServiceType(), request.getVehicleType(), "DEFAULT"
                )
                .orElseThrow(() -> ApiException.notFound(
                        "PRICING_RULE_NOT_FOUND",
                        "No active pricing rule for " + request.getServiceType() + " / " + request.getVehicleType()
                ));

        // 2. Estimate route distance and duration (FR-PRI-005)
        RoutingService.RouteEstimate route = routingService.estimateRoute(
                request.getPickupLatitude(), request.getPickupLongitude(),
                request.getDropoffLatitude(), request.getDropoffLongitude()
        );

        // 3. Compute dynamic surge multiplier (FR-PRI-007...012)
        BigDecimal surgeMultiplier = surgeService.calculateSurgeMultiplier(
                request.getPickupLatitude(), request.getPickupLongitude()
        );

        // 4. Calculate fare components (FR-PRI-002, FR-PRI-016)
        BigDecimal distanceKm = BigDecimal.valueOf(route.distanceMeters() / 1000.0);
        BigDecimal durationMinutes = BigDecimal.valueOf(route.durationSeconds() / 60.0);

        BigDecimal baseFare = rule.getBaseFare();
        BigDecimal distanceFare = rule.getPerKmRate().multiply(distanceKm).setScale(2, RoundingMode.HALF_UP);
        BigDecimal timeFare = rule.getPerMinuteRate().multiply(durationMinutes).setScale(2, RoundingMode.HALF_UP);

        BigDecimal subtotal = baseFare.add(distanceFare).add(timeFare);
        BigDecimal applicableFare = subtotal.max(rule.getMinimumFare());

        // Apply surge multiplier
        BigDecimal surgedFare = applicableFare.multiply(surgeMultiplier);

        // Round to nearest 1,000 VND
        BigDecimal totalFare = surgedFare.divide(BigDecimal.valueOf(1000), 0, RoundingMode.CEILING)
                .multiply(BigDecimal.valueOf(1000));

        Instant now = Instant.now();
        Instant expiresAt = now.plus(QUOTE_VALIDITY_MINUTES, ChronoUnit.MINUTES);

        // 5. Persist FareQuote (FR-PRI-013, FR-PRI-014)
        FareQuote quote = FareQuote.builder()
                .customerId(request.getCustomerId())
                .serviceType(request.getServiceType())
                .vehicleType(request.getVehicleType())
                .pickupLatitude(request.getPickupLatitude())
                .pickupLongitude(request.getPickupLongitude())
                .pickupAddress(request.getPickupAddress())
                .dropoffLatitude(request.getDropoffLatitude())
                .dropoffLongitude(request.getDropoffLongitude())
                .dropoffAddress(request.getDropoffAddress())
                .distanceMeters(route.distanceMeters())
                .durationSeconds(route.durationSeconds())
                .baseFare(baseFare)
                .distanceFare(distanceFare)
                .timeFare(timeFare)
                .surgeMultiplier(surgeMultiplier)
                .totalFare(totalFare)
                .currency(rule.getCurrency())
                .ruleVersion(rule.getVersion())
                .expiresAt(expiresAt)
                .used(false)
                .build();

        FareQuote saved = fareQuoteRepository.save(quote);
        log.info("Quote generated: {} for customer {} - Total: {} VND (Surge: {}x)",
                saved.getId(), saved.getCustomerId(), totalFare, surgeMultiplier);

        return mapToDTO(saved);
    }

    @Transactional(readOnly = true)
    public FareQuoteDTO getQuoteById(UUID quoteId) {
        FareQuote quote = fareQuoteRepository.findById(quoteId)
                .orElseThrow(() -> ApiException.notFound("QUOTE_NOT_FOUND", "Quote not found: " + quoteId));

        return mapToDTO(quote);
    }

    @Transactional(readOnly = true)
    public FareQuote validateAndGetQuote(UUID quoteId, UUID customerId) {
        FareQuote quote = fareQuoteRepository.findById(quoteId)
                .orElseThrow(() -> ApiException.notFound("QUOTE_NOT_FOUND", "Fare quote not found: " + quoteId));

        if (!quote.getCustomerId().equals(customerId)) {
            throw ApiException.forbidden("QUOTE_CUSTOMER_MISMATCH", "This quote does not belong to the requesting customer");
        }

        if (quote.isUsed()) {
            throw ApiException.badRequest("QUOTE_ALREADY_USED", "Fare quote has already been used");
        }

        if (quote.getExpiresAt().isBefore(Instant.now())) {
            throw ApiException.badRequest("QUOTE_EXPIRED", "Fare quote has expired");
        }

        return quote;
    }

    private FareQuoteDTO mapToDTO(FareQuote q) {
        double distKm = Math.round((q.getDistanceMeters() / 1000.0) * 10.0) / 10.0;
        long durMins = Math.round(q.getDurationSeconds() / 60.0);
        boolean isExpired = q.getExpiresAt().isBefore(Instant.now());

        return FareQuoteDTO.builder()
                .quoteId(q.getId())
                .customerId(q.getCustomerId())
                .serviceType(q.getServiceType())
                .vehicleType(q.getVehicleType())
                .pickupAddress(q.getPickupAddress())
                .dropoffAddress(q.getDropoffAddress())
                .distanceKm(distKm)
                .durationMinutes(durMins)
                .baseFare(q.getBaseFare())
                .distanceFare(q.getDistanceFare())
                .timeFare(q.getTimeFare())
                .surgeMultiplier(q.getSurgeMultiplier())
                .totalFare(q.getTotalFare())
                .currency(q.getCurrency())
                .ruleVersion(q.getRuleVersion())
                .expiresAt(q.getExpiresAt())
                .isExpired(isExpired)
                .build();
    }

    private void validateCoordinates(double lat, double lng) {
        if (lat < -90.0 || lat > 90.0 || lng < -180.0 || lng > 180.0) {
            throw ApiException.badRequest("INVALID_COORDINATES", "Coordinates out of bounds: (" + lat + ", " + lng + ")");
        }
    }
}
