package com.example.rhl.domain.wallet;

import com.example.rhl.common.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/drivers/{driverId}/wallet")
@RequiredArgsConstructor
public class WalletController {

    private final WalletService walletService;

    @GetMapping
    public ResponseEntity<ApiResponse<WalletDTO>> getWallet(
            @PathVariable UUID driverId) {

        WalletDTO wallet = walletService.getDriverWallet(driverId);
        return ResponseEntity.ok(ApiResponse.success(wallet));
    }

    @GetMapping("/entries")
    public ResponseEntity<ApiResponse<List<WalletEntryDTO>>> getEntries(
            @PathVariable UUID driverId) {

        List<WalletEntryDTO> entries = walletService.getWalletEntries(driverId);
        return ResponseEntity.ok(ApiResponse.success(entries));
    }
}
