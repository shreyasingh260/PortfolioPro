package com.portfoliopro.service;

import com.portfoliopro.dto.Dtos.NotificationDto;
import com.portfoliopro.entity.Notification;
import com.portfoliopro.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository repo;

    public void createTradeNotification(Long userId, String symbol, String type, int qty, BigDecimal price) {
        Notification n = new Notification();
        n.setUserId(userId);
        n.setType("TRADE");
        n.setTitle(type + " Order Executed");
        n.setMessage(String.format("%s %d shares of %s at ₹%.2f",
                type.equals("BUY") ? "Bought" : "Sold", qty, symbol, price));
        n.setRelatedRoute("/tradelab");
        n.setRead(false);
        n.setCreatedAt(LocalDateTime.now());
        repo.save(n);
    }

    public void createRiskNotification(Long userId, String message) {
        Notification n = new Notification();
        n.setUserId(userId);
        n.setType("RISK");
        n.setTitle("Portfolio Risk Alert");
        n.setMessage(message);
        n.setRelatedRoute("/portfolio-health");
        n.setRead(false);
        n.setCreatedAt(LocalDateTime.now());
        repo.save(n);
    }

    public void createScenarioNotification(Long userId, String scenarioName) {
        Notification n = new Notification();
        n.setUserId(userId);
        n.setType("SCENARIO");
        n.setTitle("Scenario Saved");
        n.setMessage("Shock scenario '" + scenarioName + "' has been saved.");
        n.setRelatedRoute("/market-shock-lab");
        n.setRead(false);
        n.setCreatedAt(LocalDateTime.now());
        repo.save(n);
    }

    public List<NotificationDto> getForUser(Long userId) {
        return repo.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(n -> new NotificationDto(n.getId(), n.getTitle(), n.getMessage(),
                        n.getType(), n.getRelatedRoute(), n.isRead(), n.getCreatedAt()))
                .toList();
    }

    public long getUnreadCount(Long userId) {
        return repo.countByUserIdAndReadFalse(userId);
    }

    public NotificationDto markRead(Long userId, Long notifId) {
        Notification n = repo.findByIdAndUserId(notifId, userId)
                .orElseThrow(() -> new IllegalArgumentException("Notification not found"));
        n.setRead(true);
        n = repo.save(n);
        return new NotificationDto(n.getId(), n.getTitle(), n.getMessage(),
                n.getType(), n.getRelatedRoute(), n.isRead(), n.getCreatedAt());
    }
}
