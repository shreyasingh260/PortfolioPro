package com.portfoliopro.controller;

import com.portfoliopro.dto.Dtos.AccountResponse;
import com.portfoliopro.dto.Dtos.HoldingView;
import com.portfoliopro.service.PortfolioService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class PortfolioController {
    private final PortfolioService portfolio;

    @GetMapping("/portfolio")
    public List<HoldingView> holdings(@AuthenticationPrincipal Long userId) { return portfolio.holdings(userId); }

    @GetMapping("/account")
    public AccountResponse account(@AuthenticationPrincipal Long userId) { return portfolio.account(userId); }

    @GetMapping("/me")
    public Map<String, Object> me(@AuthenticationPrincipal Long userId) {
        AccountResponse acc = portfolio.account(userId);
        return Map.of("id", userId, "name", acc.name(), "email", acc.email(), "balance", acc.balance());
    }
}
