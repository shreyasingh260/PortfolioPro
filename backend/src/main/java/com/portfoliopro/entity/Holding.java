package com.portfoliopro.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Entity
@Table(name = "holdings", uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "stock_id"}))
@Getter @Setter @NoArgsConstructor
public class Holding {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER, optional = false)
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToOne(fetch = FetchType.EAGER, optional = false)
    @JoinColumn(name = "stock_id")
    private Stock stock;

    @Column(nullable = false)
    private int quantity;

    @Column(name = "avg_price", nullable = false, precision = 12, scale = 2)
    private BigDecimal avgPrice;

    public Holding(User user, Stock stock, int quantity, BigDecimal avgPrice) {
        this.user = user;
        this.stock = stock;
        this.quantity = quantity;
        this.avgPrice = avgPrice;
    }
}
