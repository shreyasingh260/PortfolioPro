package com.portfoliopro.service;

import com.portfoliopro.dto.Dtos.*;
import com.portfoliopro.entity.User;
import com.portfoliopro.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final UserRepository users;
    private final AnalyticsService analyticsService;
    private final NotificationService notificationService;
    private final PortfolioHealthService healthService;

    @Transactional
    public DashboardSummary getSummary(Long userId) {
        User user = users.findById(userId).orElseThrow();
        AnalyticsResponse analytics = analyticsService.overview(userId);
        PortfolioHealthResponse health = healthService.computeHealth(userId);
        long unread = notificationService.getUnreadCount(userId);

        return new DashboardSummary(
                user.getName(),
                analytics.totalValue(),
                analytics.cash(),
                analytics.invested(),
                analytics.pnl(),
                analytics.pnlPct(),
                BigDecimal.ZERO,          // realized PnL - simplified
                analytics.dayChange(),
                analytics.dayChangePct(),
                health.overallScore(),
                health.riskLevel(),
                analytics.holdingsCount(),
                unread
        );
    }
}
