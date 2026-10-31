-- Optional: Hibernate creates these tables automatically (spring.jpa.hibernate.ddl-auto=update).
-- Use this file if you prefer to create the schema yourself and set ddl-auto=validate.
CREATE DATABASE IF NOT EXISTS portfoliopro;
USE portfoliopro;

CREATE TABLE users (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(120) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  balance DECIMAL(14,2) NOT NULL DEFAULT 1000000.00,
  created_at DATETIME(6)
);

CREATE TABLE stocks (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  symbol VARCHAR(15) NOT NULL UNIQUE,
  company VARCHAR(120),
  sector VARCHAR(60),
  price DECIMAL(12,2),
  prev_close DECIMAL(12,2),
  pe_ratio DECIMAL(6,2),
  sma_20 DECIMAL(12,2)
);

CREATE TABLE holdings (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT NOT NULL,
  stock_id BIGINT NOT NULL,
  quantity INT NOT NULL,
  avg_price DECIMAL(12,2) NOT NULL,
  UNIQUE (user_id, stock_id),
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (stock_id) REFERENCES stocks(id)
);

CREATE TABLE orders (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT NOT NULL,
  stock_id BIGINT NOT NULL,
  type VARCHAR(4) NOT NULL,
  quantity INT NOT NULL,
  price DECIMAL(12,2) NOT NULL,
  created_at DATETIME(6),
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (stock_id) REFERENCES stocks(id)
);

CREATE TABLE portfolio_snapshots (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT NOT NULL,
  snap_date DATE NOT NULL,
  total_value DECIMAL(14,2) NOT NULL,
  UNIQUE (user_id, snap_date),
  FOREIGN KEY (user_id) REFERENCES users(id)
);
