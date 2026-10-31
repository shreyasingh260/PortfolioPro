package com.portfoliopro.controller;

import com.portfoliopro.dto.Dtos.*;
import com.portfoliopro.service.AnalyticsService;
import com.portfoliopro.service.PortfolioHealthService;
import com.portfoliopro.service.PortfolioService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/portfolio-health")
@RequiredArgsConstructor
public class PortfolioHealthController {

    private final PortfolioHealthService health;
    private final PortfolioService portfolio;
    private final AnalyticsService analytics;

    @GetMapping("/summary")
    public PortfolioHealthResponse summary(@AuthenticationPrincipal Long userId) {
        return health.computeHealth(userId);
    }

    @GetMapping("/allocation")
    public Map<String, BigDecimal> allocation(@AuthenticationPrincipal Long userId) {
        return health.computeHealth(userId).sectorAllocation();
    }

    @GetMapping("/concentration")
    public Map<String, Object> concentration(@AuthenticationPrincipal Long userId) {
        PortfolioHealthResponse h = health.computeHealth(userId);
        return Map.of(
                "largestPositionPct", h.largestPositionPct(),
                "largestSectorPct", h.largestSectorPct(),
                "holdingsCount", h.holdingsCount(),
                "sectorCount", h.sectorCount(),
                "warnings", h.warnings()
        );
    }
}
