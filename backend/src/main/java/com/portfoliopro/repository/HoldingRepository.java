package com.portfoliopro.repository;

import com.portfoliopro.entity.Holding;
import com.portfoliopro.entity.Stock;
import com.portfoliopro.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface HoldingRepository extends JpaRepository<Holding, Long> {
    List<Holding> findByUser(User user);
    Optional<Holding> findByUserAndStock(User user, Stock stock);
}
