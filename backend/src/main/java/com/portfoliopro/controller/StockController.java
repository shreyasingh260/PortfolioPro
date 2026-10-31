package com.portfoliopro.controller;

import com.portfoliopro.dto.Dtos.StockDto;
import com.portfoliopro.service.StockService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/stocks")
@RequiredArgsConstructor
public class StockController {
    private final StockService stocks;

    @GetMapping
    public List<StockDto> all() { return stocks.all(); }

    @GetMapping("/{symbol}")
    public StockDto one(@PathVariable String symbol) { return stocks.bySymbol(symbol); }
}
