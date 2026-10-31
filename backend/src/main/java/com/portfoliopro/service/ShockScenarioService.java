package com.portfoliopro.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.portfoliopro.dto.Dtos.*;
import com.portfoliopro.entity.*;
import com.portfoliopro.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
public class ShockScenarioService {

    private final ShockScenarioRepository scenarioRepo;
    private final HoldingRepository holdings;
    private final UserRepository users;
    private final StockRepository stocks;
    private final NotificationService notifications;
    private final ObjectMapper objectMapper;

    @Transactional(readOnly = true)
    public ScenarioResult preview(Long userId, ScenarioRequest req) {
        User user = users.findById(userId).orElseThrow();
        List<Holding> userHoldings = holdings.findByUser(user);

        // Build shock map: stock symbol -> effective shock %
        Map<String, Double> stockShocks = new HashMap<>();
        double marketShock = 0;
        Map<String, Double> sectorShocks = new HashMap<>();

        for (ShockItem item : req.shocks()) {
            switch (item.type()) {
                case "MARKET" -> marketShock = item.pctChange();
                case "SECTOR" -> sectorShocks.put(item.target().toUpperCase(), item.pctChange());
                case "STOCK" -> stockShocks.put(item.target().toUpperCase(), item.pctChange());
            }
        }

        BigDecimal cashBalance = user.getBalance();
        BigDecimal currentTotal = cashBalance;
        BigDecimal shockedTotal = cashBalance;
        List<ScenarioHoldingResult> impacts = new ArrayList<>();
        Map<String, BigDecimal> sectorImpactMap = new LinkedHashMap<>();

        for (Holding h : userHoldings) {
            Stock s = h.getStock();
            BigDecimal currentPrice = s.getPrice();
            BigDecimal qty = BigDecimal.valueOf(h.getQuantity());
            BigDecimal currentValue = currentPrice.multiply(qty);

            // Determine effective shock: stock-specific takes precedence, then sector, then market
            double effectiveShock;
            if (stockShocks.containsKey(s.getSymbol())) {
                effectiveShock = stockShocks.get(s.getSymbol());
            } else if (sectorShocks.containsKey(s.getSector().toUpperCase())) {
                effectiveShock = sectorShocks.get(s.getSector().toUpperCase());
            } else {
                effectiveShock = marketShock;
            }

            BigDecimal multiplier = BigDecimal.ONE.add(BigDecimal.valueOf(effectiveShock / 100.0));
            BigDecimal shockedPrice = currentPrice.multiply(multiplier).setScale(2, RoundingMode.HALF_UP);
            if (shockedPrice.compareTo(BigDecimal.ZERO) < 0) shockedPrice = BigDecimal.ZERO;
            BigDecimal shockedValue = shockedPrice.multiply(qty);
            BigDecimal impact = shockedValue.subtract(currentValue);
            BigDecimal impactPct = currentValue.signum() == 0 ? BigDecimal.ZERO
                    : impact.multiply(BigDecimal.valueOf(100)).divide(currentValue, 2, RoundingMode.HALF_UP);

            currentTotal = currentTotal.add(currentValue);
            shockedTotal = shockedTotal.add(shockedValue);

            sectorImpactMap.merge(s.getSector(), impact, BigDecimal::add);

            impacts.add(new ScenarioHoldingResult(s.getSymbol(), s.getCompany(), s.getSector(),
                    h.getQuantity(), currentPrice, shockedPrice, currentValue, shockedValue, impact, impactPct));
        }

        BigDecimal totalImpact = shockedTotal.subtract(currentTotal);
        BigDecimal totalImpactPct = currentTotal.signum() == 0 ? BigDecimal.ZERO
                : totalImpact.multiply(BigDecimal.valueOf(100)).divide(currentTotal, 2, RoundingMode.HALF_UP);

        impacts.sort(Comparator.comparing(ScenarioHoldingResult::impactAmount));

        return new ScenarioResult(req.name(), currentTotal, shockedTotal, cashBalance,
                totalImpact, totalImpactPct, impacts, sectorImpactMap);
    }

    @Transactional
    public ScenarioSummary save(Long userId, ScenarioRequest req) {
        ScenarioResult result = preview(userId, req);
        ShockScenario scenario = new ShockScenario();
        scenario.setUserId(userId);
        scenario.setName(req.name());
        try {
            scenario.setScenarioConfig(objectMapper.writeValueAsString(req.shocks()));
        } catch (Exception e) {
            scenario.setScenarioConfig("[]");
        }
        scenario.setEstimatedPortfolioValue(result.shockedPortfolioValue());
        scenario.setEstimatedPnl(result.impactAmount());
        scenario.setCreatedAt(LocalDateTime.now());
        ShockScenario saved = scenarioRepo.save(scenario);
        notifications.createScenarioNotification(userId, req.name());
        return new ScenarioSummary(saved.getId(), saved.getName(),
                saved.getEstimatedPortfolioValue(), saved.getEstimatedPnl(), saved.getCreatedAt());
    }

    @Transactional(readOnly = true)
    public List<ScenarioSummary> list(Long userId) {
        return scenarioRepo.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(s -> new ScenarioSummary(s.getId(), s.getName(),
                        s.getEstimatedPortfolioValue(), s.getEstimatedPnl(), s.getCreatedAt()))
                .toList();
    }

    @Transactional
    public void delete(Long userId, Long id) {
        ShockScenario s = scenarioRepo.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new IllegalArgumentException("Scenario not found"));
        scenarioRepo.delete(s);
    }
}
