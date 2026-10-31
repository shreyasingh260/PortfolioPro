package com.portfoliopro.controller;

import com.portfoliopro.dto.Dtos.SettingsDto;
import com.portfoliopro.service.UserSettingsService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/settings")
@RequiredArgsConstructor
public class SettingsController {

    private final UserSettingsService service;

    @GetMapping
    public SettingsDto get(@AuthenticationPrincipal Long userId) {
        return service.get(userId);
    }

    @PutMapping
    public SettingsDto update(@AuthenticationPrincipal Long userId, @RequestBody SettingsDto dto) {
        return service.update(userId, dto);
    }
}
