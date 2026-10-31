package com.portfoliopro.service;

import com.portfoliopro.entity.Snapshot;
import com.portfoliopro.entity.User;
import com.portfoliopro.repository.HoldingRepository;
import com.portfoliopro.repository.SnapshotRepository;
import com.portfoliopro.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;

@Service
@RequiredArgsConstructor
public class SnapshotService {
    private final SnapshotRepository snapshots;
    private final HoldingRepository holdings;
    private final UserRepository users;

    /** Cash plus market value of all holdings. */
    public BigDecimal totalValue(User u) {
        BigDecimal equity = holdings.findByUser(u).stream()
                .map(h -> h.getStock().getPrice().multiply(BigDecimal.valueOf(h.getQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        return u.getBalance().add(equity);
    }

    @Transactional
    public void upsertToday(User u) {
        LocalDate today = LocalDate.now();
        Snapshot s = snapshots.findByUserIdAndSnapDate(u.getId(), today).orElseGet(() -> {
            Snapshot n = new Snapshot();
            n.setUserId(u.getId());
            n.setSnapDate(today);
            return n;
        });
        s.setTotalValue(totalValue(u));
        snapshots.save(s);
    }

    /** Flat history for a new account so the chart is never a single dot. */
    @Transactional
    public void backfill(User u, int days) {
        for (int i = days; i >= 1; i--) {
            Snapshot s = new Snapshot();
            s.setUserId(u.getId());
            s.setSnapDate(LocalDate.now().minusDays(i));
            s.setTotalValue(u.getBalance());
            snapshots.save(s);
        }
    }

    @Transactional
    public void snapshotAll() {
        users.findAll().forEach(this::upsertToday);
    }
}
