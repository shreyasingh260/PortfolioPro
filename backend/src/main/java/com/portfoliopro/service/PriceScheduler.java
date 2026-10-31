package com.portfoliopro.service;

import com.portfoliopro.entity.Stock;
import com.portfoliopro.repository.StockRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.concurrent.ThreadLocalRandom;

/**
 * No live market feed: prices are sample data. Every minute each price moves by up to 0.5%,
 * and at midnight the day's close becomes the next day's previous close.
 */
@Component
@RequiredArgsConstructor
public class PriceScheduler {
    private final StockRepository stocks;
    private final SnapshotService snapshots;

    @Scheduled(fixedRate = 60_000, initialDelay = 60_000)
    @Transactional
    public void nudgePrices() {
        List<Stock> all = stocks.findAll();
        for (Stock s : all) {
            double move = ThreadLocalRandom.current().nextDouble(-0.005, 0.005);
            BigDecimal next = s.getPrice().multiply(BigDecimal.valueOf(1 + move)).setScale(2, RoundingMode.HALF_UP);
            if (next.signum() > 0) s.setPrice(next);
        }
        stocks.saveAll(all);
    }

    @Scheduled(cron = "0 0 0 * * *")
    @Transactional
    public void rollDay() {
        snapshots.snapshotAll();
        List<Stock> all = stocks.findAll();
        all.forEach(s -> s.setPrevClose(s.getPrice()));
        stocks.saveAll(all);
    }
}
