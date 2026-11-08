package com.example.rhl.domain.wallet;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WalletDTO {
    private UUID walletId;
    private UUID driverId;
    private BigDecimal balance;
    private String currency;
    private WalletStatus status;
}
