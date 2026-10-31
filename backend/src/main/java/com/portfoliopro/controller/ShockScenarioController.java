package com.portfoliopro.controller;

import com.portfoliopro.dto.Dtos.*;
import com.portfoliopro.service.ShockScenarioService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/scenarios")
@RequiredArgsConstructor
public class ShockScenarioController {

    private final ShockScenarioService service;

    @PostMapping("/preview")
    public ScenarioResult preview(@AuthenticationPrincipal Long userId,
                                  @Valid @RequestBody ScenarioRequest req) {
        return service.preview(userId, req);
    }

    @PostMapping
    public ScenarioSummary save(@AuthenticationPrincipal Long userId,
                                @Valid @RequestBody ScenarioRequest req) {
        return service.save(userId, req);
    }

    @GetMapping
    public List<ScenarioSummary> list(@AuthenticationPrincipal Long userId) {
        return service.list(userId);
    }

    @DeleteMapping("/{id}")
    public void delete(@AuthenticationPrincipal Long userId, @PathVariable Long id) {
        service.delete(userId, id);
    }
}
