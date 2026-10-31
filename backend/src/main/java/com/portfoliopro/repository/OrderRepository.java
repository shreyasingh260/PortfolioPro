package com.portfoliopro.repository;

import com.portfoliopro.entity.Orders;
import com.portfoliopro.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface OrderRepository extends JpaRepository<Orders, Long> {
    List<Orders> findTop50ByUserOrderByCreatedAtDesc(User user);
    List<Orders> findByUserOrderByCreatedAtDesc(User user);
}
