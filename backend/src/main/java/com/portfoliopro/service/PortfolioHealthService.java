package com.portfoliopro.service;

import com.portfoliopro.dto.Dtos.*;
import com.portfoliopro.repository.HoldingRepository;
import com.portfoliopro.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.*;

@Service
@RequiredArgsConstructor
public class PortfolioHealthService {

    private final UserRepository users;
    private final HoldingRepository holdings;
    private final PortfolioService portfolioService;

    public PortfolioHealthResponse computeHealth(Long userId) {
        List<HoldingView> hv = portfolioService.holdings(userId);

        if (hv.isEmpty()) {
            return new PortfolioHealthResponse(0, "HIGH", BigDecimal.ZERO, BigDecimal.ZERO, 0, 0,
                    List.of(new HealthScoreDetail("Diversification", 0, 30, 30,
                            "No holdings to analyze.")),
                    Map.of(),
                    List.of("Your portfolio is empty. Start trading to see health metrics."));
        }

        BigDecimal totalValue = hv.stream().map(HoldingView::currentValue)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // Calculate sector allocation
        Map<String, BigDecimal> sectors = new LinkedHashMap<>();
        for (HoldingView h : hv) {
            sectors.merge(h.sector(), h.currentValue(), BigDecimal::add);
        }
        Map<String, BigDecimal> sectorPct = new LinkedHashMap<>();
        sectors.forEach((s, v) -> sectorPct.put(s,
                v.multiply(BigDecimal.valueOf(100)).divide(totalValue, 2, RoundingMode.HALF_UP)));

        // Largest position %
        BigDecimal largestPos = hv.stream()
                .map(h -> h.currentValue().multiply(BigDecimal.valueOf(100))
                        .divide(totalValue, 2, RoundingMode.HALF_UP))
                .max(Comparator.naturalOrder()).orElse(BigDecimal.ZERO);

        // Largest sector %
        BigDecimal largestSector = sectorPct.values().stream()
                .max(Comparator.naturalOrder()).orElse(BigDecimal.ZERO);

        int holdingsCount = hv.size();
        int sectorCount = sectors.size();

        // SCORE COMPONENTS (total max = 100)
        // 1. Diversification by holdings count (max 30)
        int divScore = Math.min(30, holdingsCount * 6); // 5+ holdings = full 30

        // 2. Position concentration (max 30) - penalize if any single position > 30%
        double lp = largestPos.doubleValue();
        int posScore;
        if (lp <= 20) posScore = 30;
        else if (lp <= 30) posScore = 25;
        else if (lp <= 40) posScore = 15;
        else if (lp <= 60) posScore = 5;
        else posScore = 0;

        // 3. Sector concentration (max 25) - penalize if any sector > 50%
        double ls = largestSector.doubleValue();
        int sectScore;
        if (ls <= 30) sectScore = 25;
        else if (ls <= 50) sectScore = 20;
        else if (ls <= 70) sectScore = 10;
        else sectScore = 0;

        // 4. Sector count (max 15)
        int sectCountScore = Math.min(15, sectorCount * 5); // 3+ sectors = full 15

        int overallScore = divScore + posScore + sectScore + sectCountScore;

        String riskLevel = overallScore >= 70 ? "LOW" : overallScore >= 45 ? "MEDIUM" : "HIGH";

        List<HealthScoreDetail> breakdown = List.of(
                new HealthScoreDetail("Holdings Diversification", divScore, 30, 30,
                        String.format("You hold %d stocks. More diverse holdings improve stability.", holdingsCount)),
                new HealthScoreDetail("Position Concentration", posScore, 30, 30,
                        String.format("Largest single position is %.1f%% of portfolio.", lp)),
                new HealthScoreDetail("Sector Concentration", sectScore, 25, 25,
                        String.format("Largest sector exposure is %.1f%% of portfolio.", ls)),
                new HealthScoreDetail("Sector Diversity", sectCountScore, 15, 15,
                        String.format("You are invested across %d sector(s).", sectorCount))
        );

        List<String> warnings = new ArrayList<>();
        if (holdingsCount < 3)
            warnings.add("Very few holdings. Consider diversifying across more stocks.");
        if (lp > 40)
            warnings.add(String.format(
                    "Your largest holding accounts for %.1f%% of portfolio. A price decline in this position could materially affect your total value.", lp));
        if (ls > 50)
            warnings.add(String.format(
                    "%.1f%% of your portfolio is concentrated in one sector. Sector-specific events could have a large impact.", ls));
        if (sectorCount < 3)
            warnings.add("Your holdings span fewer than 3 sectors. Consider adding exposure to other industries.");

        return new PortfolioHealthResponse(overallScore, riskLevel, largestPos, largestSector,
                holdingsCount, sectorCount, breakdown, sectorPct, warnings);
    }
}
