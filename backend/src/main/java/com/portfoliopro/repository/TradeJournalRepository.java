package com.portfoliopro.repository;

import com.portfoliopro.entity.TradeJournal;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TradeJournalRepository extends JpaRepository<TradeJournal, Long> {
    List<TradeJournal> findByUserIdOrderByCreatedAtDesc(Long userId);
    List<TradeJournal> findByUserIdAndRelatedOrderId(Long userId, Long orderId);
}
