package com.portfoliopro.repository;

import com.portfoliopro.entity.ShockScenario;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ShockScenarioRepository extends JpaRepository<ShockScenario, Long> {
    List<ShockScenario> findByUserIdOrderByCreatedAtDesc(Long userId);
    Optional<ShockScenario> findByIdAndUserId(Long id, Long userId);
}
