package com.portfoliopro.service;

import com.portfoliopro.dto.Dtos.SettingsDto;
import com.portfoliopro.entity.UserSettings;
import com.portfoliopro.repository.UserSettingsRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class UserSettingsService {

    private final UserSettingsRepository repo;

    @Transactional(readOnly = true)
    public SettingsDto get(Long userId) {
        return repo.findByUserId(userId)
                .map(s -> new SettingsDto(s.getCurrency(), s.isTradeConfirmation(),
                        s.isRiskAlerts(), s.isTradeAlerts()))
                .orElse(new SettingsDto("INR", true, true, true));
    }

    @Transactional
    public SettingsDto update(Long userId, SettingsDto dto) {
        UserSettings s = repo.findByUserId(userId).orElse(new UserSettings());
        s.setUserId(userId);
        s.setCurrency(dto.currency());
        s.setTradeConfirmation(dto.tradeConfirmation());
        s.setRiskAlerts(dto.riskAlerts());
        s.setTradeAlerts(dto.tradeAlerts());
        s.setUpdatedAt(LocalDateTime.now());
        repo.save(s);
        return dto;
    }
}
