package com.portfoliopro.service;

import com.portfoliopro.dto.Dtos.StockDto;
import com.portfoliopro.repository.StockRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class StockService {
    private final StockRepository stocks;

    public List<StockDto> all() {
        return stocks.findAllByOrderBySymbolAsc().stream().map(StockDto::from).toList();
    }

    public StockDto bySymbol(String symbol) {
        return stocks.findBySymbol(symbol.toUpperCase()).map(StockDto::from)
                .orElseThrow(() -> new IllegalArgumentException("Unknown symbol: " + symbol));
    }
}
