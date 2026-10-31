# PortfolioPro — Smart Trading & Portfolio Intelligence

> **B.Tech Computer Science & Engineering Major Project**  
> An explainable stock trading simulator and portfolio analytics platform built with **Spring Boot 3 (Java 21/25)**, **Angular 17**, and **MySQL 8**.

---

## 1. Project Overview & Problem Statement

Retail investors frequently enter equity markets without hands-on simulation experience, clear visibility into portfolio concentration risks, or understanding of how market shocks impact their wealth. 

**PortfolioPro** solves this problem by combining an authoritative virtual paper trading engine with deterministic portfolio analytics:
- **Zero-Risk Simulation:** Execute realistic trades using virtual money in an Indian equity universe.
- **Explainable Health Diagnosis:** Understand concentration risks through transparent scoring algorithms rather than black-box AI claims.
- **Market Shock Telemetry:** Stress-test existing holdings against historical crashes and sector downturns before they occur in real life.
- **Behavioral Trade Reflection:** Track trade rationales and psychological patterns via an integrated trade journal.

---

## 2. The Four Core MVP Modules

### MVP 1 — TradeLab: Paper Trading Engine
- Real-time stock discovery across 16 seeded Indian equities (IT, Banking, Energy, Pharma, FMCG).
- Authoritative backend trade execution with atomic database transactions.
- Virtual wallet tracking: available cash, invested capital, current market value, and unrealized P&L.
- Transaction friction modeling: 0.1% simulated regulatory and broker charges.
- Cost basis calculation using **Weighted Average Cost Basis (WAC)**.

### MVP 2 — Portfolio Health Doctor
- Explainable **0–100 Health Score Index** based on a transparent 4-component weighted model:
  1. *Holdings Diversification (max 30 pts)*
  2. *Position Concentration (max 30 pts)*
  3. *Sector Concentration (max 25 pts)*
  4. *Sector Diversity (max 15 pts)*
- Rule-based alerts when single positions exceed 40% or sector exposure exceeds 50%.
- Interactive Sector Diversification Donut chart (Chart.js).

### MVP 3 — Market Shock Lab
- Non-destructive hypothetical stress testing:
  - **Mild Correction (-10% market-wide)**
  - **Black Swan Market Crash (-30% market-wide)**
  - **IT Sector Meltdown (-25% IT equities)**
  - **Banking Crisis (-20% Banking equities)**
  - **Custom Multi-Asset Shocks**
- Precise calculation: `Shocked Price = Current Price × (1 + Shock% / 100)`
- Per-holding drawdown breakdown and sector contribution analysis.
- Scenario persistence: save, inspect, and delete scenarios.

### MVP 4 — TradeLens: Trading Behaviour Analyzer
- Performance ledger: win/loss distributions, gross buy/sell volumes, realized P&L.
- Transaction fee impact: fee-to-realized-gain ratio tracking.
- Interactive Trading Journal: tag strategies (Momentum, Value, Swing, Growth), document entry theses, and review exit rationale.
- Deterministic behavioral insight generator.

---

## 3. Technology Stack

| Layer | Technologies & Tools |
|---|---|
| **Frontend** | Angular 17 (Standalone Components, Signals), TypeScript 5.4, RxJS 7.8 |
| **Styling** | Custom SCSS Design System (Deep Navy `#071B33`, Crisp `#F4F8FD` workspace) |
| **Data Visualization** | Chart.js 4.4 (Canvas Line Performance & Donut Allocation charts) |
| **Icons & Branding** | Custom inline vector SVG iconography (zero external web images) |
| **Backend** | Java 21/25, Spring Boot 3.2.5 (Modular Monolith) |
| **Security** | Spring Security 6, JWT (io.jsonwebtoken 0.12.5), BCrypt Password Hashing |
| **Data Persistence** | Spring Data JPA / Hibernate 6, MySQL 8 Connector/J |
| **Database** | MySQL 8.0 relational database with transactional foreign keys |
| **Build & Test** | Maven 3.6+ (`mvnw` wrapper included), JUnit 5, Mockito |

---

## 4. System Architecture

```
┌────────────────────────────────────────────────────────┐
│                   Angular 17 Client                    │
│   ┌───────────────────────┬────────────────────────┐   │
│   │   Deep Navy Sidebar   │   Main Workspace Top   │   │
│   │   • Dashboard         │   • Search Bar         │   │
│   │   • TradeLab          │   • Demo Notice Badge  │   │
│   │   • Portfolio Health  │   • In-App Notifs Bell │   │
│   │   • Market Shock Lab  │   • Profile Dropdown   │   │
│   │   • TradeLens         │                        │   │
│   │   • Settings          │   • Router Outlet View │   │
│   └───────────────────────┴────────────────────────┘   │
└───────────────────────────┬────────────────────────────┘
                            │ REST / JSON (JWT Bearer)
┌───────────────────────────▼────────────────────────────┐
│              Spring Boot 3.2.5 Monolith                │
│   ┌────────────────────────────────────────────────┐   │
│   │  Controllers: Auth, Portfolio, Trade, Stocks,  │   │
│   │  Dashboard, Health, Scenarios, TradeLens, Notif│   │
│   └───────────────────────┬────────────────────────┘   │
│   ┌───────────────────────▼────────────────────────┐   │
│   │  Services & Authoritative Financial Calculators│   │
│   └───────────────────────┬────────────────────────┘   │
│   ┌───────────────────────▼────────────────────────┐   │
│   │  Spring Data JPA Repositories (PessimisticLock)│   │
│   └───────────────────────┬────────────────────────┘   │
└───────────────────────────┼────────────────────────────┘
                            │ JDBC (HikariCP)
┌───────────────────────────▼────────────────────────────┐
│                      MySQL 8.0                         │
│   users, stocks, holdings, orders, portfolio_snapshots,│
│   trade_journal, shock_scenarios, notifications,       │
│   user_settings                                        │
└────────────────────────────────────────────────────────┘
```

---

## 5. Financial Calculation Methodology

### 1. Weighted Average Cost (WAC) Accumulation
When additional shares of an existing holding are purchased:
$$\text{New Average Price} = \frac{(\text{Current Qty} \times \text{Old Avg Price}) + (\text{New Qty} \times \text{Execution Price})}{\text{Current Qty} + \text{New Qty}}$$

### 2. Transaction Charges
A simulated fee of **0.1%** is levied on gross order value:
$$\text{Charges} = \text{Price} \times \text{Quantity} \times 0.001$$
- **Buy Order:** $\text{Cash Deducted} = \text{Gross Value} + \text{Charges}$
- **Sell Order:** $\text{Cash Credited} = \text{Gross Value} - \text{Charges}$

### 3. Market Shock Formula
Hypothetical stress value for any held asset:
$$\text{Shocked Value} = \text{Quantity} \times [\text{Current Price} \times (1 + \frac{\text{Shock \%}}{100})]$$
$$\text{Portfolio Impact} = (\sum \text{Shocked Values} + \text{Cash}) - \text{Current Total Portfolio Value}$$

---

## 6. Demo Account & First-Run Credentials

PortfolioPro includes an automatic database seed on first startup:

- **Email:** `demo@portfoliopro.local`
- **Password:** `Demo@12345`
- **Initial Virtual Cash:** ₹7,50,000.00
- **Seeded Holdings:** TCS (10), HDFCBANK (15), RELIANCE (8), SUNPHARMA (5), ITC (20)
- **Pre-populated Records:** 5 filled orders, 2 trade journal entries, 2 notifications

*Note: Demo data disclaimer is permanently displayed in the top navbar: "Demo Market Data — Not Live Quotes".*

---

## 7. Setup & Execution Guide

### Prerequisites
1. **Java Development Kit (JDK 17 or higher)**
2. **Node.js (v18+ or v20+) & npm**
3. **MySQL Server 8.0** running on `localhost:3306`

### Database Setup
Ensure MySQL is running. The database `portfoliopro_db` is created automatically on application startup.
Configure `backend/src/main/resources/application.properties` with your MySQL credentials:
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/portfoliopro_db?createDatabaseIfNotExist=true&useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC
spring.datasource.username=root
spring.datasource.password=your_mysql_password
```

### Running the Backend (Spring Boot)
Open a terminal in `backend/`:
```bash
# Using the bundled Maven wrapper:
cmd /c "mvnw.cmd spring-boot:run"

# Or if pre-packaged JAR is used:
java -jar target/portfoliopro-1.0.0.jar
```
Backend initializes and listens on `http://localhost:8080`.

### Running the Frontend (Angular)
Open a terminal in `frontend/`:
```bash
npm install
npx ng serve --port 4200
```
Navigate your browser to `http://localhost:4200`.

---

## 8. Automated Test Execution

Run the backend JUnit 5 financial calculation test suite:
```bash
cd backend
cmd /c "mvnw.cmd test"
```

Verified tests:
- `testWeightedAverageCostBasis`: Validates share accumulation cost averaging.
- `testSimulatedTransactionCharges`: Validates 0.1% transaction friction modeling.
- `testMarketShockCalculation`: Validates stress scenario price and portfolio drawdown formulas.
- `testPortfolioHealthScoreComponents`: Validates deterministic multi-factor health scores.
- `testUnrealizedPnlCalculation`: Validates exact decimal gain/loss arithmetic.

---

## 9. API Reference

All backend endpoints are scoped under `/api`:

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/login` | Authenticate user & return signed JWT |
| `POST` | `/api/auth/signup` | Register new user with ₹10,00,000 virtual balance |
| `GET` | `/api/stocks` | List equity universe with PE, SMA-20, & quotes |
| `POST` | `/api/trade` | Execute transactional BUY / SELL order |
| `GET` | `/api/orders` | Retrieve user order execution history |
| `GET` | `/api/portfolio` | Retrieve user holding positions & P&L |
| `GET` | `/api/dashboard/summary` | Consolidated KPI telemetry & health score |
| `GET` | `/api/portfolio-health/summary` | 4-factor health score breakdown & warnings |
| `POST` | `/api/scenarios/preview` | Calculate hypothetical shock impact |
| `POST` | `/api/scenarios` | Save stress test scenario |
| `GET` | `/api/tradelens/summary` | Win rate, fee ratio, & behavioral insights |
| `GET` | `/api/tradelens/journal` | List trade journal entries |
| `GET` | `/api/notifications` | Retrieve user in-app notifications |
| `GET` | `/api/settings` | Retrieve user preferences |

---

## 10. Known Limitations & Future Enhancements

### Educational Disclosures
- Stock prices are simulated starter values based on Indian equity tickers. They move via an internal price scheduler to simulate intraday volatility.
- PortfolioPro does not connect to a real brokerage API and executes paper trades exclusively.

### Future Scope
- Integration with SEBI-registered broker sandbox APIs.
- Monte Carlo portfolio simulation engine.
- Technical candlestick charting integration.
- Export portfolio statements to CSV and PDF.

---

## 11. Project Evaluation Viva Checklist

1. **Architecture Walkthrough:** Demonstrate the modular monolith pattern, JPA entities, and separation of concerns.
2. **Order Execution:** Place a BUY order in TradeLab, demonstrate cash balance decrement and average cost basis calculation.
3. **Selling Constraints:** Attempt to sell more shares than owned to demonstrate backend constraint validation.
4. **Health Score Telemetry:** Walk through the 4-component score breakdown on Portfolio Health Doctor.
5. **Market Crash Simulation:** Trigger the "Black Swan (-30%)" preset in Market Shock Lab and verify that real portfolio balances remain completely untouched.
6. **Trade Journaling:** Add a trade thesis in TradeLens and view real-time behavioral insights.
