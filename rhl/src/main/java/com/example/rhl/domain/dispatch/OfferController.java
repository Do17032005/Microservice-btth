package com.example.rhl.domain.dispatch;

import com.example.rhl.common.ApiResponse;
import com.example.rhl.domain.trip.TripService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
public class OfferController {

    private final TripService tripService;

    @GetMapping("/drivers/{driverId}/offers")
    public ResponseEntity<ApiResponse<List<DriverOfferDTO>>> getPendingOffers(
            @PathVariable UUID driverId) {

        List<DriverOfferDTO> offers = tripService.getPendingOffersByDriver(driverId);
        return ResponseEntity.ok(ApiResponse.success(offers));
    }

    @PostMapping("/offers/{offerId}/accept")
    public ResponseEntity<ApiResponse<DriverOfferDTO>> acceptOffer(
            @PathVariable UUID offerId,
            @RequestParam UUID driverId) {

        DriverOfferDTO acceptedOffer = tripService.acceptOffer(offerId, driverId);
        return ResponseEntity.ok(ApiResponse.success("Offer accepted successfully", acceptedOffer));
    }

    @PostMapping("/offers/{offerId}/reject")
    public ResponseEntity<ApiResponse<String>> rejectOffer(
            @PathVariable UUID offerId,
            @RequestParam UUID driverId) {

        tripService.rejectOffer(offerId, driverId);
        return ResponseEntity.ok(ApiResponse.success("Offer rejected", null));
    }
}
