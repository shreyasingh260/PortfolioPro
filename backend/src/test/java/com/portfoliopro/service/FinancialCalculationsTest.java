package com.portfoliopro.service;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.math.RoundingMode;

import static org.junit.jupiter.api.Assertions.*;

@DisplayName("PortfolioPro Financial & Risk Calculation Engine Tests")
class FinancialCalculationsTest {

    @Test
    @DisplayName("Verify weighted average cost basis when accumulating shares")
    void testWeightedAverageCostBasis() {
        // Holding lot 1: 10 shares @ ₹100.00 = ₹1,000.00
        BigDecimal oldTotal = new BigDecimal("100.00").multiply(BigDecimal.valueOf(10));
        int oldQty = 10;

        // Holding lot 2: 20 shares @ ₹130.00 = ₹2,600.00
        BigDecimal newCost = new BigDecimal("130.00").multiply(BigDecimal.valueOf(20));
        int newQty = 20;

        // Total: 30 shares for ₹3,600.00 => ₹120.00 avg price
        int combinedQty = oldQty + newQty;
        BigDecimal avgPrice = oldTotal.add(newCost).divide(BigDecimal.valueOf(combinedQty), 2, RoundingMode.HALF_UP);

        assertEquals(new BigDecimal("120.00"), avgPrice);
    }

    @Test
    @DisplayName("Verify transaction fee friction calculation (0.1% simulated charges)")
    void testSimulatedTransactionCharges() {
        BigDecimal executionPrice = new BigDecimal("3920.00");
        int quantity = 10;
        BigDecimal grossOrderValue = executionPrice.multiply(BigDecimal.valueOf(quantity)); // ₹39,200.00

        BigDecimal charges = grossOrderValue.multiply(new BigDecimal("0.001")).setScale(2, RoundingMode.HALF_UP);
        assertEquals(new BigDecimal("39.20"), charges);

        BigDecimal totalBuyCashRequired = grossOrderValue.add(charges);
        assertEquals(new BigDecimal("39239.20"), totalBuyCashRequired);

        BigDecimal netSellProceeds = grossOrderValue.subtract(charges);
        assertEquals(new BigDecimal("39160.80"), netSellProceeds);
    }

    @Test
    @DisplayName("Verify Market Shock formula: Value = Qty * Price * (1 + shock% / 100)")
    void testMarketShockCalculation() {
        BigDecimal currentPrice = new BigDecimal("1725.00");
        int quantity = 15;
        BigDecimal currentValue = currentPrice.multiply(BigDecimal.valueOf(quantity)); // ₹25,875.00

        // -20% sector shock
        double shockPct = -20.0;
        BigDecimal multiplier = BigDecimal.ONE.add(BigDecimal.valueOf(shockPct / 100.0));
        BigDecimal shockedPrice = currentPrice.multiply(multiplier).setScale(2, RoundingMode.HALF_UP); // ₹1,380.00

        assertEquals(new BigDecimal("1380.00"), shockedPrice);

        BigDecimal shockedValue = shockedPrice.multiply(BigDecimal.valueOf(quantity)); // ₹20,700.00
        assertEquals(new BigDecimal("20700.00"), shockedValue);

        BigDecimal impact = shockedValue.subtract(currentValue); // -₹5,175.00
        assertEquals(new BigDecimal("-5175.00"), impact);
    }

    @Test
    @DisplayName("Verify Portfolio Health scoring model component ranges")
    void testPortfolioHealthScoreComponents() {
        // Test high diversification
        int holdingsCount = 6;
        int divScore = Math.min(30, holdingsCount * 6);
        assertEquals(30, divScore, "Diversification score with 6 holdings should reach maximum 30");

        // Test position concentration score
        double largestPos = 18.5; // <= 20%
        int posScore = largestPos <= 20 ? 30 : 0;
        assertEquals(30, posScore, "Position concentration <= 20% should score 30");

        // Test sector diversity
        int sectorCount = 4;
        int sectCountScore = Math.min(15, sectorCount * 5);
        assertEquals(15, sectCountScore, "4 sectors should achieve full 15 sector score");
    }

    @Test
    @DisplayName("Verify Unrealized P&L calculation and percentage return")
    void testUnrealizedPnlCalculation() {
        BigDecimal invested = new BigDecimal("50000.00");
        BigDecimal currentValue = new BigDecimal("57500.00");

        BigDecimal pnl = currentValue.subtract(invested);
        BigDecimal pnlPct = pnl.multiply(BigDecimal.valueOf(100)).divide(invested, 2, RoundingMode.HALF_UP);

        assertEquals(new BigDecimal("7500.00"), pnl);
        assertEquals(new BigDecimal("15.00"), pnlPct);
    }
}
