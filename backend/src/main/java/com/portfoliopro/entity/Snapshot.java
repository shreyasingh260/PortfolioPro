package com.portfoliopro.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;

/** One row per user per day: cash + market value of holdings. */
@Entity
@Table(name = "portfolio_snapshots", uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "snap_date"}))
@Getter @Setter @NoArgsConstructor
public class Snapshot {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "snap_date", nullable = false)
    private LocalDate snapDate;

    @Column(name = "total_value", nullable = false, precision = 14, scale = 2)
    private BigDecimal totalValue;
}
