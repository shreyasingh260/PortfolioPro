package com.portfoliopro.config;

import com.portfoliopro.entity.*;
import com.portfoliopro.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

/** Seeds sample stocks and a demo user on first start. */
@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {
    private final StockRepository stocks;
    private final UserRepository users;
    private final HoldingRepository holdings;
    private final OrderRepository orders;
    private final TradeJournalRepository journals;
    private final NotificationRepository notifications;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        seedStocks();
        seedDemoUser();
    }

    private void seedStocks() {
        if (stocks.count() > 0) return;
        stocks.saveAll(List.of(
            new Stock("TCS",        "Tata Consultancy Services",   "IT",      "3920.00", "3895.00", "29.5", "3870.00"),
            new Stock("INFY",       "Infosys",                     "IT",      "1655.00", "1668.00", "24.8", "1640.00"),
            new Stock("WIPRO",      "Wipro",                       "IT",       "482.00",  "479.00", "21.2",  "470.00"),
            new Stock("HCLTECH",    "HCL Technologies",            "IT",      "1710.00", "1702.00", "25.6", "1685.00"),
            new Stock("HDFCBANK",   "HDFC Bank",                   "Banking", "1725.00", "1712.00", "18.9", "1700.00"),
            new Stock("ICICIBANK",  "ICICI Bank",                  "Banking", "1258.00", "1265.00", "17.4", "1240.00"),
            new Stock("SBIN",       "State Bank of India",         "Banking",  "815.00",  "809.00", "10.8",  "800.00"),
            new Stock("KOTAKBANK",  "Kotak Mahindra Bank",         "Banking", "1790.00", "1798.00", "19.6", "1775.00"),
            new Stock("RELIANCE",   "Reliance Industries",         "Energy",  "1405.00", "1396.00", "27.3", "1390.00"),
            new Stock("ONGC",       "Oil and Natural Gas Corp",    "Energy",   "248.00",  "251.00",  "7.9",  "245.00"),
            new Stock("NTPC",       "NTPC",                        "Energy",   "342.00",  "339.00", "16.1",  "335.00"),
            new Stock("SUNPHARMA",  "Sun Pharmaceutical",          "Pharma",  "1715.00", "1704.00", "35.2", "1690.00"),
            new Stock("DRREDDY",    "Dr. Reddy's Laboratories",    "Pharma",  "1262.00", "1270.00", "19.8", "1250.00"),
            new Stock("CIPLA",      "Cipla",                       "Pharma",  "1548.00", "1541.00", "26.4", "1530.00"),
            new Stock("ITC",        "ITC",                         "FMCG",    "421.00",  "423.00",  "26.9",  "415.00"),
            new Stock("HINDUNILVR", "Hindustan Unilever",          "FMCG",   "2452.00", "2447.00", "52.3", "2430.00")
        ));
    }

    private void seedDemoUser() {
        final String demoEmail = "demo@portfoliopro.local";
        if (users.findByEmail(demoEmail).isPresent()) return;

        // Create demo user
        User demo = new User();
        demo.setName("Demo Investor");
        demo.setEmail(demoEmail);
        demo.setPassword(passwordEncoder.encode("Demo@12345"));
        demo.setBalance(new BigDecimal("750000.00"));
        demo.setCreatedAt(LocalDateTime.now().minusDays(30));
        demo = users.save(demo);

        // Seed 5 holdings + corresponding buy orders
        record SeedHolding(String symbol, int qty, String avgPrice) {}
        List<SeedHolding> seedData = List.of(
            new SeedHolding("TCS",       10, "3800.00"),
            new SeedHolding("HDFCBANK",  15, "1680.00"),
            new SeedHolding("RELIANCE",   8, "1370.00"),
            new SeedHolding("SUNPHARMA",  5, "1650.00"),
            new SeedHolding("ITC",       20,  "410.00")
        );

        for (SeedHolding sh : seedData) {
            Stock stock = stocks.findBySymbol(sh.symbol()).orElse(null);
            if (stock == null) continue;

            BigDecimal avgPrice = new BigDecimal(sh.avgPrice());

            // Save holding
            Holding h = new Holding(demo, stock, sh.qty(), avgPrice);
            holdings.save(h);

            // Save buy order
            Orders order = new Orders(demo, stock, OrderType.BUY, sh.qty(), avgPrice);
            orders.save(order);
        }

        // Seed 2 journal entries
        TradeJournal j1 = new TradeJournal();
        j1.setUserId(demo.getId());
        j1.setStrategy("Momentum");
        j1.setEntryNotes("Bought TCS on strong quarterly results and IT sector tailwinds. Good volume support.");
        j1.setExitNotes(null);
        j1.setObservations("Stock is trading above SMA-20, positive RSI divergence.");
        j1.setCreatedAt(LocalDateTime.now().minusDays(20));
        j1.setUpdatedAt(LocalDateTime.now().minusDays(20));
        journals.save(j1);

        TradeJournal j2 = new TradeJournal();
        j2.setUserId(demo.getId());
        j2.setStrategy("Value Investing");
        j2.setEntryNotes("Initiated position in HDFCBANK. Strong fundamentals, attractive valuation post-correction.");
        j2.setExitNotes(null);
        j2.setObservations("Credit quality improving, NIM expansion expected. Long-term hold.");
        j2.setCreatedAt(LocalDateTime.now().minusDays(15));
        j2.setUpdatedAt(LocalDateTime.now().minusDays(15));
        journals.save(j2);

        // Seed 2 notifications
        Notification n1 = new Notification();
        n1.setUserId(demo.getId());
        n1.setType("TRADE");
        n1.setTitle("BUY Order Executed");
        n1.setMessage("Bought 10 shares of TCS at ₹3800.00");
        n1.setRelatedRoute("/tradelab");
        n1.setRead(false);
        n1.setCreatedAt(LocalDateTime.now().minusDays(20));
        notifications.save(n1);

        Notification n2 = new Notification();
        n2.setUserId(demo.getId());
        n2.setType("SYSTEM");
        n2.setTitle("Welcome to PortfolioPro!");
        n2.setMessage("Your demo account is set up with ₹7,50,000 cash and sample holdings. Start exploring!");
        n2.setRelatedRoute("/dashboard");
        n2.setRead(false);
        n2.setCreatedAt(LocalDateTime.now().minusDays(30));
        notifications.save(n2);
    }
}

