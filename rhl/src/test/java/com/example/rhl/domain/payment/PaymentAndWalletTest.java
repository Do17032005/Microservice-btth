package com.example.rhl.domain.payment;

import com.example.rhl.common.ApiException;
import com.example.rhl.domain.trip.Trip;
import com.example.rhl.domain.trip.TripRepository;
import com.example.rhl.domain.trip.TripStatus;
import com.example.rhl.domain.wallet.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PaymentAndWalletTest {

    @Mock
    private PaymentRepository paymentRepository;

    @Mock
    private TripRepository tripRepository;

    @Mock
    private WalletService walletService;

    @Mock
    private WalletRepository walletRepository;

    @Mock
    private WalletEntryRepository walletEntryRepository;

    @InjectMocks
    private PaymentService paymentService;

    private WalletService concreteWalletService;

    private UUID tripId;
    private UUID customerId;
    private UUID driverId;
    private Trip completedTrip;

    @BeforeEach
    void setUp() {
        tripId = UUID.randomUUID();
        customerId = UUID.randomUUID();
        driverId = UUID.randomUUID();

        completedTrip = Trip.builder()
                .id(tripId)
                .tripCode("TRIP-PAY-123")
                .customerId(customerId)
                .driverId(driverId)
                .status(TripStatus.COMPLETED)
                .finalFare(BigDecimal.valueOf(50000)) // 50,000 VND
                .currency("VND")
                .build();

        concreteWalletService = new WalletService(walletRepository, walletEntryRepository);
    }

    @Test
    @DisplayName("Should process payment and split 20% platform commission and 80% driver net earning (FR-WAL-003, BR-012)")
    void testProcessPaymentAndCommissionSplit() {
        when(tripRepository.findById(tripId)).thenReturn(Optional.of(completedTrip));
        when(paymentRepository.findByTripId(tripId)).thenReturn(Optional.empty());
        when(paymentRepository.save(any(Payment.class))).thenAnswer(i -> {
            Payment p = i.getArgument(0);
            p.setId(UUID.randomUUID());
            return p;
        });

        PaymentDTO res = paymentService.processTripPayment(tripId, PaymentMethod.E_WALLET_SANDBOX, "IDEMP-PAY-1");

        assertNotNull(res);
        assertEquals(BigDecimal.valueOf(50000), res.getAmount());
        assertEquals(PaymentStatus.SUCCEEDED, res.getStatus());

        // Verify wallet service was called with 80% net earning (40,000 VND) and 20% commission (10,000 VND)
        verify(walletService, times(1)).creditDriverEarning(
                eq(driverId),
                eq(tripId),
                eq("TRIP-PAY-123"),
                eq(BigDecimal.valueOf(40000)),
                eq(BigDecimal.valueOf(10000))
        );
    }

    @Test
    @DisplayName("Should reject payment if trip is not completed")
    void testRejectPaymentForUncompletedTrip() {
        completedTrip.setStatus(TripStatus.IN_TRIP);
        when(tripRepository.findById(tripId)).thenReturn(Optional.of(completedTrip));

        ApiException ex = assertThrows(ApiException.class, () ->
                paymentService.processTripPayment(tripId, PaymentMethod.E_WALLET_SANDBOX, null)
        );

        assertEquals("TRIP_NOT_COMPLETED", ex.getCode());
    }

    @Test
    @DisplayName("Wallet ledger: Crediting driver creates immutable entry and updates balance atomically (FR-WAL-002)")
    void testWalletCreditCreatesLedgerEntry() {
        UUID walletId = UUID.randomUUID();
        Wallet wallet = Wallet.builder()
                .id(walletId)
                .driverId(driverId)
                .currency("VND")
                .balance(BigDecimal.valueOf(100000)) // starting with 100k
                .status(WalletStatus.ACTIVE)
                .build();

        when(walletRepository.findByDriverId(driverId)).thenReturn(Optional.of(wallet));
        when(walletEntryRepository.findByWalletIdOrderByCreatedAtDesc(walletId)).thenReturn(Collections.emptyList());

        // Credit 40k net earning
        concreteWalletService.creditDriverEarning(driverId, tripId, "TRIP-PAY-123", BigDecimal.valueOf(40000), BigDecimal.valueOf(10000));

        // New balance should be 140,000 VND
        assertEquals(BigDecimal.valueOf(140000), wallet.getBalance());
        verify(walletEntryRepository, times(1)).save(argThat(entry ->
                entry.getEntryType() == WalletEntryType.TRIP_EARNING &&
                entry.getAmount().equals(BigDecimal.valueOf(40000)) &&
                entry.getBalanceAfter().equals(BigDecimal.valueOf(140000)) &&
                entry.getReferenceId().equals(tripId.toString())
        ));
    }

    @Test
    @DisplayName("Wallet ledger: Idempotent credit prevents duplicate addition for same trip (FR-WAL-005)")
    void testWalletCreditIdempotency() {
        UUID walletId = UUID.randomUUID();
        Wallet wallet = Wallet.builder()
                .id(walletId)
                .driverId(driverId)
                .currency("VND")
                .balance(BigDecimal.valueOf(100000))
                .status(WalletStatus.ACTIVE)
                .build();

        WalletEntry existingEntry = WalletEntry.builder()
                .walletId(walletId)
                .entryType(WalletEntryType.TRIP_EARNING)
                .referenceId(tripId.toString())
                .amount(BigDecimal.valueOf(40000))
                .balanceAfter(BigDecimal.valueOf(140000))
                .build();

        when(walletRepository.findByDriverId(driverId)).thenReturn(Optional.of(wallet));
        when(walletEntryRepository.findByWalletIdOrderByCreatedAtDesc(walletId)).thenReturn(List.of(existingEntry));

        // Attempting to credit again for same trip
        concreteWalletService.creditDriverEarning(driverId, tripId, "TRIP-PAY-123", BigDecimal.valueOf(40000), BigDecimal.valueOf(10000));

        // Balance must remain unchanged at 100,000
        assertEquals(BigDecimal.valueOf(100000), wallet.getBalance());
        verify(walletEntryRepository, never()).save(any(WalletEntry.class));
    }
}
