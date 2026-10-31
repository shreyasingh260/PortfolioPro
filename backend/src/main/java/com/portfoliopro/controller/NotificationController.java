package com.portfoliopro.controller;

import com.portfoliopro.dto.Dtos.NotificationDto;
import com.portfoliopro.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService service;

    @GetMapping
    public List<NotificationDto> list(@AuthenticationPrincipal Long userId) {
        return service.getForUser(userId);
    }

    @GetMapping("/unread-count")
    public Map<String, Long> unreadCount(@AuthenticationPrincipal Long userId) {
        return Map.of("count", service.getUnreadCount(userId));
    }

    @PatchMapping("/{id}/read")
    public NotificationDto markRead(@AuthenticationPrincipal Long userId, @PathVariable Long id) {
        return service.markRead(userId, id);
    }
}
