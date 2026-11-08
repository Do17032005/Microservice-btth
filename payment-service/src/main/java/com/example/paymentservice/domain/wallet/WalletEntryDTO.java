package com.example.paymentservice.domain.wallet;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WalletEntryDTO {
    private UUID entryId;
    private UUID walletId;
    private WalletEntryType entryType;
    private BigDecimal amount;
    private BigDecimal balanceAfter;
    private String currency;
    private String referenceType;
    private String referenceId;
    private String notes;
    private Instant createdAt;
}
