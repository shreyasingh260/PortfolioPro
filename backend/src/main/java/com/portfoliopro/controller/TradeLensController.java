package com.portfoliopro.controller;

import com.portfoliopro.dto.Dtos.*;
import com.portfoliopro.service.TradeLensService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tradelens")
@RequiredArgsConstructor
public class TradeLensController {

    private final TradeLensService service;

    @GetMapping("/summary")
    public TradeLensMetrics summary(@AuthenticationPrincipal Long userId) {
        return service.getMetrics(userId);
    }

    @GetMapping("/journal")
    public List<JournalResponse> journal(@AuthenticationPrincipal Long userId) {
        return service.getJournal(userId);
    }

    @PostMapping("/journal")
    public JournalResponse createJournal(@AuthenticationPrincipal Long userId,
                                         @Valid @RequestBody JournalRequest req) {
        return service.createJournal(userId, req);
    }

    @PutMapping("/journal/{id}")
    public JournalResponse updateJournal(@AuthenticationPrincipal Long userId,
                                         @PathVariable Long id,
                                         @Valid @RequestBody JournalRequest req) {
        return service.updateJournal(userId, id, req);
    }

    @DeleteMapping("/journal/{id}")
    public void deleteJournal(@AuthenticationPrincipal Long userId, @PathVariable Long id) {
        service.deleteJournal(userId, id);
    }
}
