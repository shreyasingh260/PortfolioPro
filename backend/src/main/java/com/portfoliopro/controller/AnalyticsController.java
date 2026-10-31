package com.portfoliopro.controller;

import com.portfoliopro.dto.Dtos.AnalyticsResponse;
import com.portfoliopro.service.AnalyticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/analytics")
@RequiredArgsConstructor
public class AnalyticsController {
    private final AnalyticsService analytics;

    @GetMapping("/overview")
    public AnalyticsResponse overview(@AuthenticationPrincipal Long userId) { return analytics.overview(userId); }
}
