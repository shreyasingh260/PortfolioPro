package com.portfoliopro;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class PortfolioProApplication {
    public static void main(String[] args) {
        SpringApplication.run(PortfolioProApplication.class, args);
    }
}
