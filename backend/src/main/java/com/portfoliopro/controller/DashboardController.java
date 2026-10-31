package com.portfoliopro.controller;

import com.portfoliopro.dto.Dtos.*;
import com.portfoliopro.service.AnalyticsService;
import com.portfoliopro.service.DashboardService;
import com.portfoliopro.service.StockService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboard;
    private final AnalyticsService analytics;
    private final StockService stockService;

    @GetMapping("/summary")
    public DashboardSummary summary(@AuthenticationPrincipal Long userId) {
        return dashboard.getSummary(userId);
    }

    @GetMapping("/performance")
    public List<SnapshotPoint> performance(@AuthenticationPrincipal Long userId) {
        return analytics.overview(userId).history();
    }

    @GetMapping("/market-watch")
    public List<StockDto> marketWatch() {
        return stockService.all().stream().limit(10).toList();
    }
}
