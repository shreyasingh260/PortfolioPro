package com.portfoliopro.service;

import com.portfoliopro.dto.Dtos.AccountResponse;
import com.portfoliopro.dto.Dtos.HoldingView;
import com.portfoliopro.entity.Holding;
import com.portfoliopro.entity.Stock;
import com.portfoliopro.entity.User;
import com.portfoliopro.repository.HoldingRepository;
import com.portfoliopro.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.Comparator;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PortfolioService {
    private final UserRepository users;
    private final HoldingRepository holdings;

    @Transactional(readOnly = true)
    public AccountResponse account(Long userId) {
        User u = users.findById(userId).orElseThrow();
        return new AccountResponse(u.getName(), u.getEmail(), u.getBalance());
    }

    @Transactional(readOnly = true)
    public List<HoldingView> holdings(Long userId) {
        User u = users.findById(userId).orElseThrow();
        return holdings.findByUser(u).stream()
                .map(this::toView)
                .sorted(Comparator.comparing(HoldingView::currentValue).reversed())
                .toList();
    }

    private HoldingView toView(Holding h) {
        Stock s = h.getStock();
        BigDecimal qty = BigDecimal.valueOf(h.getQuantity());
        BigDecimal invested = h.getAvgPrice().multiply(qty);
        BigDecimal value = s.getPrice().multiply(qty);
        BigDecimal pnl = value.subtract(invested);
        BigDecimal pnlPct = invested.signum() == 0 ? BigDecimal.ZERO
                : pnl.multiply(BigDecimal.valueOf(100)).divide(invested, 2, RoundingMode.HALF_UP);
        BigDecimal day = s.getPrice().subtract(s.getPrevClose()).multiply(qty);
        return new HoldingView(s.getSymbol(), s.getCompany(), s.getSector(), h.getQuantity(), h.getAvgPrice(),
                s.getPrice(), invested, value, pnl, pnlPct, day);
    }
}
