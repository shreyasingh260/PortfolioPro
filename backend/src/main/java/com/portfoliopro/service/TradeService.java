package com.portfoliopro.service;

import com.portfoliopro.dto.Dtos.OrderView;
import com.portfoliopro.dto.Dtos.TradeRequest;
import com.portfoliopro.entity.*;
import com.portfoliopro.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;

@Service
@RequiredArgsConstructor
public class TradeService {
    private final UserRepository users;
    private final StockRepository stocks;
    private final HoldingRepository holdings;
    private final OrderRepository orders;
    private final SnapshotService snapshots;
    private final NotificationService notifications;
    private final PortfolioService portfolioService;

    /** Executes a market order at the stock's current price. */
    @Transactional
    public OrderView execute(Long userId, TradeRequest req) {
        User user = users.findByIdForUpdate(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        Stock stock = stocks.findBySymbol(req.symbol().trim().toUpperCase())
                .orElseThrow(() -> new IllegalArgumentException("Unknown symbol: " + req.symbol()));

        int qty = req.quantity();
        BigDecimal price = stock.getPrice();
        BigDecimal cost = price.multiply(BigDecimal.valueOf(qty));
        Holding h = holdings.findByUserAndStock(user, stock).orElse(null);

        if (req.type() == OrderType.BUY) {
            if (user.getBalance().compareTo(cost) < 0)
                throw new IllegalStateException("Not enough cash for this order");
            user.setBalance(user.getBalance().subtract(cost));
            if (h == null) {
                h = new Holding(user, stock, qty, price);
            } else {
                BigDecimal oldTotal = h.getAvgPrice().multiply(BigDecimal.valueOf(h.getQuantity()));
                int newQty = h.getQuantity() + qty;
                h.setAvgPrice(oldTotal.add(cost).divide(BigDecimal.valueOf(newQty), 2, RoundingMode.HALF_UP));
                h.setQuantity(newQty);
            }
            holdings.save(h);
        } else {
            if (h == null || h.getQuantity() < qty)
                throw new IllegalStateException("You do not own enough shares to sell");
            user.setBalance(user.getBalance().add(cost));
            h.setQuantity(h.getQuantity() - qty);
            if (h.getQuantity() == 0) holdings.delete(h); else holdings.save(h);
        }

        users.save(user);
        Orders saved = orders.save(new Orders(user, stock, req.type(), qty, price));
        snapshots.upsertToday(user);

        // Send trade notification
        notifications.createTradeNotification(userId, stock.getSymbol(), req.type().name(), qty, price);

        // Check for risk: send risk notification if any position > 40%
        try {
            List<com.portfoliopro.dto.Dtos.HoldingView> hvList = portfolioService.holdings(userId);
            BigDecimal totalVal = hvList.stream().map(com.portfoliopro.dto.Dtos.HoldingView::currentValue)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
            if (totalVal.signum() > 0) {
                hvList.stream()
                    .filter(hv -> hv.currentValue().multiply(BigDecimal.valueOf(100))
                            .divide(totalVal, 2, RoundingMode.HALF_UP)
                            .doubleValue() > 40.0)
                    .findFirst()
                    .ifPresent(hv -> notifications.createRiskNotification(userId,
                            String.format("%s accounts for over 40%% of your portfolio. Consider rebalancing.", hv.symbol())));
            }
        } catch (Exception ignored) {}

        return OrderView.from(saved);
    }

    @Transactional(readOnly = true)
    public List<OrderView> history(Long userId) {
        User user = users.findById(userId).orElseThrow();
        return orders.findTop50ByUserOrderByCreatedAtDesc(user).stream().map(OrderView::from).toList();
    }
}
