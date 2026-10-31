package com.portfoliopro.service;

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
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TradeLensService {

    private final OrderRepository orderRepo;
    private final TradeJournalRepository journalRepo;
    private final UserRepository users;

    @Transactional(readOnly = true)
    public TradeLensMetrics getMetrics(Long userId) {
        User user = users.findById(userId).orElseThrow();
        List<Orders> allOrders = orderRepo.findByUserOrderByCreatedAtDesc(user);

        int buyCount = 0, sellCount = 0;
        BigDecimal grossBuy = BigDecimal.ZERO, grossSell = BigDecimal.ZERO;
        Map<String, BigDecimal> buyBySymbol = new LinkedHashMap<>();
        Map<String, BigDecimal> sellBySymbol = new LinkedHashMap<>();
        Map<String, String> symbolSector = new LinkedHashMap<>();
        Map<String, String> symbolCompany = new LinkedHashMap<>();

        for (Orders o : allOrders) {
            BigDecimal val = o.getPrice().multiply(BigDecimal.valueOf(o.getQuantity()));
            symbolSector.put(o.getStock().getSymbol(), o.getStock().getSector());
            symbolCompany.put(o.getStock().getSymbol(), o.getStock().getCompany());
            if (o.getType() == OrderType.BUY) {
                buyCount++;
                grossBuy = grossBuy.add(val);
                buyBySymbol.merge(o.getStock().getSymbol(), val, BigDecimal::add);
            } else {
                sellCount++;
                grossSell = grossSell.add(val);
                sellBySymbol.merge(o.getStock().getSymbol(), val, BigDecimal::add);
            }
        }

        // Simulate 0.1% charges on each trade
        BigDecimal totalCharges = grossBuy.add(grossSell)
                .multiply(new BigDecimal("0.001")).setScale(2, RoundingMode.HALF_UP);

        // Realized PnL per stock
        BigDecimal realizedPnl = BigDecimal.ZERO;
        List<StockPerfEntry> pnlByStock = new ArrayList<>();
        for (String sym : sellBySymbol.keySet()) {
            BigDecimal sold = sellBySymbol.get(sym);
            BigDecimal bought = buyBySymbol.getOrDefault(sym, BigDecimal.ZERO);
            BigDecimal stockCharges = sold.add(bought)
                    .multiply(new BigDecimal("0.001")).setScale(2, RoundingMode.HALF_UP);
            BigDecimal pnl = sold.subtract(bought).subtract(stockCharges);
            realizedPnl = realizedPnl.add(pnl);

            long tradeCount = allOrders.stream()
                    .filter(o -> o.getStock().getSymbol().equals(sym)).count();
            pnlByStock.add(new StockPerfEntry(sym, symbolCompany.getOrDefault(sym, sym),
                    bought, sold, pnl, (int) tradeCount));
        }
        pnlByStock.sort(Comparator.comparing(StockPerfEntry::realizedPnl).reversed());

        // PnL by sector
        Map<String, BigDecimal> sectorPnl = new LinkedHashMap<>();
        for (StockPerfEntry e : pnlByStock) {
            sectorPnl.merge(symbolSector.getOrDefault(e.symbol(), "Unknown"), e.realizedPnl(), BigDecimal::add);
        }
        List<SectorPerfEntry> pnlBySector = sectorPnl.entrySet().stream()
                .map(e -> new SectorPerfEntry(e.getKey(), e.getValue(),
                        (int) allOrders.stream()
                                .filter(o -> o.getStock().getSector().equals(e.getKey())).count()))
                .sorted(Comparator.comparing(SectorPerfEntry::realizedPnl).reversed())
                .toList();

        BigDecimal chargesAsGainPct = realizedPnl.abs().signum() > 0
                ? totalCharges.multiply(BigDecimal.valueOf(100)).divide(realizedPnl.abs(), 2, RoundingMode.HALF_UP)
                : BigDecimal.ZERO;

        // Behavioral insights
        List<String> insights = new ArrayList<>();
        if (allOrders.isEmpty()) {
            insights.add("No trading history found. Place some trades to see behavioral insights.");
        } else if (allOrders.size() < 3) {
            insights.add("Not enough trading history to generate behavioral insights. Complete more trades to see patterns.");
        } else {
            if (chargesAsGainPct.doubleValue() > 15)
                insights.add(String.format(
                        "Trading charges represent %.1f%% of your gross realized gains. Frequent trading increases costs.",
                        chargesAsGainPct.doubleValue()));

            List<StockPerfEntry> losers = pnlByStock.stream()
                    .filter(e -> e.realizedPnl().signum() < 0).toList();
            if (losers.size() >= 2)
                insights.add(String.format("Most of your realized losses came from %d positions: %s.",
                        losers.size(),
                        losers.stream().limit(2).map(StockPerfEntry::symbol).collect(Collectors.joining(" and "))));
        }

        if (buyCount > 0 && sellCount > 0) {
            insights.add(String.format("You have placed %d buy orders and %d sell orders across %d stocks.",
                    buyCount, sellCount, symbolSector.size()));
        }

        return new TradeLensMetrics(allOrders.size(), buyCount, sellCount, grossBuy, grossSell,
                totalCharges, realizedPnl, chargesAsGainPct, pnlByStock, pnlBySector, insights);
    }

    @Transactional(readOnly = true)
    public List<JournalResponse> getJournal(Long userId) {
        return journalRepo.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(j -> new JournalResponse(j.getId(), j.getRelatedOrderId(), j.getStrategy(),
                        j.getEntryNotes(), j.getExitNotes(), j.getObservations(),
                        j.getCreatedAt(), j.getUpdatedAt()))
                .toList();
    }

    @Transactional
    public JournalResponse createJournal(Long userId, JournalRequest req) {
        TradeJournal j = new TradeJournal();
        j.setUserId(userId);
        j.setRelatedOrderId(req.relatedOrderId());
        j.setStrategy(req.strategy());
        j.setEntryNotes(req.entryNotes());
        j.setExitNotes(req.exitNotes());
        j.setObservations(req.observations());
        j.setCreatedAt(LocalDateTime.now());
        j.setUpdatedAt(LocalDateTime.now());
        j = journalRepo.save(j);
        return new JournalResponse(j.getId(), j.getRelatedOrderId(), j.getStrategy(),
                j.getEntryNotes(), j.getExitNotes(), j.getObservations(),
                j.getCreatedAt(), j.getUpdatedAt());
    }

    @Transactional
    public JournalResponse updateJournal(Long userId, Long journalId, JournalRequest req) {
        TradeJournal j = journalRepo.findById(journalId)
                .filter(x -> x.getUserId().equals(userId))
                .orElseThrow(() -> new IllegalArgumentException("Journal entry not found"));
        j.setStrategy(req.strategy());
        j.setEntryNotes(req.entryNotes());
        j.setExitNotes(req.exitNotes());
        j.setObservations(req.observations());
        j.setUpdatedAt(LocalDateTime.now());
        j = journalRepo.save(j);
        return new JournalResponse(j.getId(), j.getRelatedOrderId(), j.getStrategy(),
                j.getEntryNotes(), j.getExitNotes(), j.getObservations(),
                j.getCreatedAt(), j.getUpdatedAt());
    }

    @Transactional
    public void deleteJournal(Long userId, Long journalId) {
        TradeJournal j = journalRepo.findById(journalId)
                .filter(x -> x.getUserId().equals(userId))
                .orElseThrow(() -> new IllegalArgumentException("Journal entry not found"));
        journalRepo.delete(j);
    }
}
