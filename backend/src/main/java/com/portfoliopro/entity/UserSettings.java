package com.portfoliopro.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "user_settings")
@Getter @Setter @NoArgsConstructor
public class UserSettings {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false, unique = true)
    private Long userId;

    @Column(length = 10)
    private String currency = "INR";

    @Column(name = "trade_confirmation", nullable = false)
    private boolean tradeConfirmation = true;

    @Column(name = "risk_alerts", nullable = false)
    private boolean riskAlerts = true;

    @Column(name = "trade_alerts", nullable = false)
    private boolean tradeAlerts = true;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
