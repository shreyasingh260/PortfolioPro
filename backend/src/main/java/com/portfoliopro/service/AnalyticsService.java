package com.portfoliopro.service;

import com.portfoliopro.dto.Dtos.*;
import com.portfoliopro.entity.Snapshot;
import com.portfoliopro.entity.User;
import com.portfoliopro.repository.SnapshotRepository;
import com.portfoliopro.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.*;
import java.util.function.Function;

@Service
@RequiredArgsConstructor
public class AnalyticsService {
    private final UserRepository users;
    private final PortfolioService portfolio;
    private final SnapshotService snapshotService;
    private final SnapshotRepository snapshots;

    @Transactional
    public AnalyticsResponse overview(Long userId) {
        User user = users.findById(userId).orElseThrow();
        snapshotService.upsertToday(user);   // keep the last point of the chart current

        List<HoldingView> hv = portfolio.holdings(userId);
        BigDecimal holdingsValue = sum(hv, HoldingView::currentValue);
        BigDecimal invested = sum(hv, HoldingView::invested);
        BigDecimal pnl = holdingsValue.subtract(invested);
        BigDecimal dayChange = sum(hv, HoldingView::dayChange);
        BigDecimal cash = user.getBalance();

        BigDecimal pnlPct = pct(pnl, invested);
        BigDecimal dayChangePct = pct(dayChange, holdingsValue.subtract(dayChange));

        // Allocation by sector
        Map<String, BigDecimal> sectors = new LinkedHashMap<>();
        for (HoldingView h : hv) sectors.merge(h.sector(), h.currentValue(), BigDecimal::add);

        double total = holdingsValue.doubleValue();
        double largestPos = total > 0
                ? hv.stream().mapToDouble(h -> h.currentValue().doubleValue()).max().orElse(0) / total * 100 : 0;
        double largestSector = total > 0
                ? sectors.values().stream().mapToDouble(BigDecimal::doubleValue).max().orElse(0) / total * 100 : 0;
        largestPos = round1(largestPos);
        largestSector = round1(largestSector);

        // Top gainers and losers inside the user's holdings
        List<HoldingPerf> gainers = hv.stream().filter(h -> h.pnlPct().signum() > 0)
                .sorted(Comparator.comparing(HoldingView::pnlPct).reversed()).limit(3)
                .map(h -> new HoldingPerf(h.symbol(), h.pnl(), h.pnlPct())).toList();
        List<HoldingPerf> losers = hv.stream().filter(h -> h.pnlPct().signum() < 0)
                .sorted(Comparator.comparing(HoldingView::pnlPct)).limit(3)
                .map(h -> new HoldingPerf(h.symbol(), h.pnl(), h.pnlPct())).toList();

        // Portfolio value over time (oldest first)
        List<Snapshot> snaps = new ArrayList<>(snapshots.findTop30ByUserIdOrderBySnapDateDesc(userId));
        Collections.reverse(snaps);
        List<SnapshotPoint> history = snaps.stream()
                .map(s -> new SnapshotPoint(s.getSnapDate(), s.getTotalValue())).toList();

        return new AnalyticsResponse(
                holdingsValue.add(cash), holdingsValue, cash, invested, pnl, pnlPct, dayChange, dayChangePct,
                sectors, history, gainers, losers,
                riskLevel(largestPos, largestSector), largestPos, largestSector, hv.size(), sectors.size());
    }

    public String riskLevel(double largestPositionPct, double largestSectorPct) {
        if (largestPositionPct > 40 || largestSectorPct > 60) return "HIGH";
        if (largestPositionPct > 25 || largestSectorPct > 40) return "MEDIUM";
        return "LOW";
    }

    private static BigDecimal sum(List<HoldingView> list, Function<HoldingView, BigDecimal> f) {
        return list.stream().map(f).reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private static BigDecimal pct(BigDecimal part, BigDecimal base) {
        return base.signum() == 0 ? BigDecimal.ZERO
                : part.multiply(BigDecimal.valueOf(100)).divide(base, 2, RoundingMode.HALF_UP);
    }

    private static double round1(double v) {
        return Math.round(v * 10.0) / 10.0;
    }
}
