package com.portfoliopro.repository;

import com.portfoliopro.entity.Snapshot;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface SnapshotRepository extends JpaRepository<Snapshot, Long> {
    List<Snapshot> findTop30ByUserIdOrderBySnapDateDesc(Long userId);
    Optional<Snapshot> findByUserIdAndSnapDate(Long userId, LocalDate date);
}
