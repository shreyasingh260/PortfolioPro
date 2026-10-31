package com.portfoliopro.controller;

import com.portfoliopro.dto.Dtos.OrderView;
import com.portfoliopro.dto.Dtos.TradeRequest;
import com.portfoliopro.service.TradeService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class TradeController {
    private final TradeService trades;

    @PostMapping("/trade")
    public OrderView trade(@AuthenticationPrincipal Long userId, @Valid @RequestBody TradeRequest req) {
        return trades.execute(userId, req);
    }

    @GetMapping("/orders")
    public List<OrderView> orders(@AuthenticationPrincipal Long userId) {
        return trades.history(userId);
    }
}
