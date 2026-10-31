package com.portfoliopro.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "trade_journal")
@Getter @Setter @NoArgsConstructor
public class TradeJournal {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "related_order_id")
    private Long relatedOrderId;

    @Column(length = 100)
    private String strategy;

    @Column(name = "entry_notes", columnDefinition = "TEXT")
    private String entryNotes;

    @Column(name = "exit_notes", columnDefinition = "TEXT")
    private String exitNotes;

    @Column(columnDefinition = "TEXT")
    private String observations;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
