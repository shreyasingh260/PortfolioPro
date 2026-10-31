package com.portfoliopro.dto;

import com.portfoliopro.entity.Orders;
import com.portfoliopro.entity.OrderType;
import com.portfoliopro.entity.Stock;
import jakarta.validation.constraints.*;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

public final class Dtos {
    private Dtos() {}

    // ----- Trade Journal -----
    public record JournalRequest(Long relatedOrderId, String strategy,
                                 @NotBlank String entryNotes, String exitNotes, String observations) {}
    public record JournalResponse(Long id, Long relatedOrderId, String strategy,
                                  String entryNotes, String exitNotes, String observations,
                                  LocalDateTime createdAt, LocalDateTime updatedAt) {}

    // ----- Shock Scenario -----
    public record ShockItem(String type, String target, double pctChange) {}
    public record ScenarioRequest(@NotBlank String name, @Size(min = 1) List<ShockItem> shocks) {}
    public record ScenarioHoldingResult(String symbol, String company, String sector, int quantity,
                                        BigDecimal currentPrice, BigDecimal shockedPrice,
                                        BigDecimal currentValue, BigDecimal shockedValue,
                                        BigDecimal impactAmount, BigDecimal impactPct) {}
    public record ScenarioResult(String name, BigDecimal currentPortfolioValue, BigDecimal shockedPortfolioValue,
                                 BigDecimal cashBalance, BigDecimal impactAmount, BigDecimal impactPct,
                                 List<ScenarioHoldingResult> holdingImpacts, Map<String, BigDecimal> sectorImpacts) {}
    public record ScenarioSummary(Long id, String name, BigDecimal estimatedPortfolioValue,
                                  BigDecimal estimatedPnl, LocalDateTime createdAt) {}

    // ----- TradeLens -----
    public record TradeLensMetrics(int totalOrders, int buyOrders, int sellOrders,
                                   BigDecimal grossBuyValue, BigDecimal grossSellValue,
                                   BigDecimal totalCharges, BigDecimal netRealizedPnl,
                                   BigDecimal chargesAsGainPct,
                                   List<StockPerfEntry> pnlByStock,
                                   List<SectorPerfEntry> pnlBySector,
                                   List<String> insights) {}
    public record StockPerfEntry(String symbol, String company,
                                 BigDecimal totalBought, BigDecimal totalSold,
                                 BigDecimal realizedPnl, int tradeCount) {}
    public record SectorPerfEntry(String sector, BigDecimal realizedPnl, int tradeCount) {}

    // ----- Notifications -----
    public record NotificationDto(Long id, String title, String message, String type,
                                  String relatedRoute, boolean isRead, LocalDateTime createdAt) {}

    // ----- Settings -----
    public record SettingsDto(String currency, boolean tradeConfirmation,
                              boolean riskAlerts, boolean tradeAlerts) {}

    // ----- Dashboard Summary -----
    public record DashboardSummary(String userName, BigDecimal totalPortfolioValue,
                                   BigDecimal availableCash, BigDecimal investedValue,
                                   BigDecimal unrealizedPnl, BigDecimal unrealizedPnlPct,
                                   BigDecimal realizedPnl, BigDecimal dayChange, BigDecimal dayChangePct,
                                   int healthScore, String riskLevel, int holdingsCount,
                                   long unreadNotifications) {}

    // ----- Portfolio Health -----
    public record HealthScoreDetail(String component, int score, int maxScore, int weight, String explanation) {}
    public record PortfolioHealthResponse(int overallScore, String riskLevel,
                                          BigDecimal largestPositionPct, BigDecimal largestSectorPct,
                                          int holdingsCount, int sectorCount,
                                          List<HealthScoreDetail> scoreBreakdown,
                                          Map<String, BigDecimal> sectorAllocation,
                                          List<String> warnings) {}

    // ----- auth -----
    public record SignupRequest(
            @NotBlank(message = "Name is required") String name,
            @NotBlank(message = "Email is required") @Email(message = "Enter a valid email address") String email,
            @NotBlank(message = "Password is required") @Size(min = 6, message = "Password must be at least 6 characters") String password) {}

    public record LoginRequest(
            @NotBlank(message = "Email is required") String email,
            @NotBlank(message = "Password is required") String password) {}

    public record AuthResponse(String token, String name, String email) {}

    // ----- account -----
    public record AccountResponse(String name, String email, BigDecimal balance) {}

    // ----- stocks -----
    public record StockDto(String symbol, String company, String sector, BigDecimal price, BigDecimal prevClose,
                           BigDecimal changePct, BigDecimal peRatio, BigDecimal sma20, String trend) {
        public static StockDto from(Stock s) {
            BigDecimal change = s.getPrevClose().signum() == 0 ? BigDecimal.ZERO
                    : s.getPrice().subtract(s.getPrevClose()).multiply(BigDecimal.valueOf(100))
                      .divide(s.getPrevClose(), 2, RoundingMode.HALF_UP);
            String trend = s.getPrice().compareTo(s.getSma20()) >= 0 ? "ABOVE" : "BELOW";
            return new StockDto(s.getSymbol(), s.getCompany(), s.getSector(), s.getPrice(), s.getPrevClose(),
                    change, s.getPeRatio(), s.getSma20(), trend);
        }
    }

    // ----- trading -----
    public record TradeRequest(
            @NotBlank(message = "Choose a stock") String symbol,
            @NotNull(message = "Choose buy or sell") OrderType type,
            @NotNull(message = "Enter a quantity") @Min(value = 1, message = "Quantity must be at least 1") Integer quantity) {}

    public record OrderView(Long id, String symbol, String company, OrderType type, int quantity,
                            BigDecimal price, BigDecimal total, LocalDateTime createdAt) {
        public static OrderView from(Orders o) {
            return new OrderView(o.getId(), o.getStock().getSymbol(), o.getStock().getCompany(), o.getType(),
                    o.getQuantity(), o.getPrice(), o.getPrice().multiply(BigDecimal.valueOf(o.getQuantity())),
                    o.getCreatedAt());
        }
    }

    // ----- portfolio -----
    public record HoldingView(String symbol, String company, String sector, int quantity, BigDecimal avgPrice,
                              BigDecimal price, BigDecimal invested, BigDecimal currentValue, BigDecimal pnl,
                              BigDecimal pnlPct, BigDecimal dayChange) {}

    // ----- analytics -----
    public record SnapshotPoint(LocalDate date, BigDecimal value) {}

    public record HoldingPerf(String symbol, BigDecimal pnl, BigDecimal pnlPct) {}

    public record AnalyticsResponse(
            BigDecimal totalValue, BigDecimal holdingsValue, BigDecimal cash,
            BigDecimal invested, BigDecimal pnl, BigDecimal pnlPct,
            BigDecimal dayChange, BigDecimal dayChangePct,
            Map<String, BigDecimal> sectorAllocation,
            List<SnapshotPoint> history,
            List<HoldingPerf> topGainers, List<HoldingPerf> topLosers,
            String riskLevel, double largestPositionPct, double largestSectorPct,
            int holdingsCount, int sectorCount) {}
}
