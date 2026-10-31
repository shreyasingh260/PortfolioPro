package com.portfoliopro.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Entity
@Table(name = "stocks")
@Getter @Setter @NoArgsConstructor
public class Stock {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 15)
    private String symbol;

    @Column(length = 120)
    private String company;

    @Column(length = 60)
    private String sector;

    @Column(precision = 12, scale = 2)
    private BigDecimal price;

    @Column(name = "prev_close", precision = 12, scale = 2)
    private BigDecimal prevClose;

    /** Fundamental: price / earnings. */
    @Column(name = "pe_ratio", precision = 6, scale = 2)
    private BigDecimal peRatio;

    /** Technical: 20-day simple moving average. */
    @Column(name = "sma_20", precision = 12, scale = 2)
    private BigDecimal sma20;

    public Stock(String symbol, String company, String sector, String price, String prevClose, String pe, String sma20) {
        this.symbol = symbol;
        this.company = company;
        this.sector = sector;
        this.price = new BigDecimal(price);
        this.prevClose = new BigDecimal(prevClose);
        this.peRatio = new BigDecimal(pe);
        this.sma20 = new BigDecimal(sma20);
    }
}
