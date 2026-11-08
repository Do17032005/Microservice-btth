package com.example.paymentservice.domain.wallet;

import com.example.paymentservice.common.ApiException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class WalletService {

    private final WalletRepository walletRepository;
    private final WalletEntryRepository walletEntryRepository;

    @Transactional
    public synchronized void creditDriverEarning(UUID driverId, UUID tripId, String tripCode, BigDecimal netEarning, BigDecimal commission) {
        Wallet wallet = walletRepository.findByDriverId(driverId)
                .orElseGet(() -> walletRepository.save(Wallet.builder()
                        .driverId(driverId)
                        .currency("VND")
                        .balance(BigDecimal.ZERO)
                        .status(WalletStatus.ACTIVE)
                        .build()));

        // FR-WAL-005: Idempotency by trip
        List<WalletEntry> existingEntries = walletEntryRepository.findByWalletIdOrderByCreatedAtDesc(wallet.getId());
        boolean alreadyCredited = existingEntries.stream().anyMatch(e ->
                tripId.toString().equals(e.getReferenceId()) && e.getEntryType() == WalletEntryType.TRIP_EARNING
        );

        if (alreadyCredited) {
            log.warn("Trip {} has already been credited to driver {}. Skipping duplicate credit.", tripCode, driverId);
            return;
        }

        // Immutable ledger update (FR-WAL-002, FR-WAL-006)
        BigDecimal currentBalance = wallet.getBalance();
        BigDecimal newBalance = currentBalance.add(netEarning);

        WalletEntry earningEntry = WalletEntry.builder()
                .walletId(wallet.getId())
                .entryType(WalletEntryType.TRIP_EARNING)
                .amount(netEarning)
                .balanceAfter(newBalance)
                .currency(wallet.getCurrency())
                .referenceType("TRIP")
                .referenceId(tripId.toString())
                .notes("Thu nhập chuyến " + tripCode + " (Hoa hồng sàn: " + commission + " VND)")
                .createdAt(Instant.now())
                .build();

        walletEntryRepository.save(earningEntry);

        wallet.setBalance(newBalance);
        walletRepository.save(wallet);

        log.info("Credited {} VND to driver {} wallet. New balance: {} VND",
                netEarning, driverId, newBalance);
    }

    @Transactional(readOnly = true)
    public WalletDTO getDriverWallet(UUID driverId) {
        Wallet wallet = walletRepository.findByDriverId(driverId)
                .orElseThrow(() -> ApiException.notFound("WALLET_NOT_FOUND", "Wallet not found for driver: " + driverId));

        return WalletDTO.builder()
                .walletId(wallet.getId())
                .driverId(wallet.getDriverId())
                .balance(wallet.getBalance())
                .currency(wallet.getCurrency())
                .status(wallet.getStatus())
                .build();
    }

    @Transactional(readOnly = true)
    public List<WalletEntryDTO> getWalletEntries(UUID driverId) {
        Wallet wallet = walletRepository.findByDriverId(driverId)
                .orElseThrow(() -> ApiException.notFound("WALLET_NOT_FOUND", "Wallet not found for driver: " + driverId));

        return walletEntryRepository.findByWalletIdOrderByCreatedAtDesc(wallet.getId()).stream()
                .map(this::mapEntryToDTO)
                .toList();
    }

    private WalletEntryDTO mapEntryToDTO(WalletEntry e) {
        return WalletEntryDTO.builder()
                .entryId(e.getId())
                .walletId(e.getWalletId())
                .entryType(e.getEntryType())
                .amount(e.getAmount())
                .balanceAfter(e.getBalanceAfter())
                .currency(e.getCurrency())
                .referenceType(e.getReferenceType())
                .referenceId(e.getReferenceId())
                .notes(e.getNotes())
                .createdAt(e.getCreatedAt())
                .build();
    }
}
