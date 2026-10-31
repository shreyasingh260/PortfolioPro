package com.portfoliopro.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "shock_scenarios")
@Getter @Setter @NoArgsConstructor
public class ShockScenario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(nullable = false, length = 200)
    private String name;

    @Column(name = "scenario_config", columnDefinition = "TEXT")
    private String scenarioConfig;

    @Column(name = "estimated_portfolio_value", precision = 16, scale = 2)
    private BigDecimal estimatedPortfolioValue;

    @Column(name = "estimated_pnl", precision = 16, scale = 2)
    private BigDecimal estimatedPnl;

    @Column(name = "created_at")
    private LocalDateTime createdAt;
}
