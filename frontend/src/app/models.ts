export interface Stock {
  symbol: string; company: string; sector: string; price: number; prevClose: number;
  changePct: number; peRatio: number; sma20: number; trend: 'ABOVE' | 'BELOW';
}
export interface Holding {
  symbol: string; company: string; sector: string; quantity: number; avgPrice: number; price: number;
  invested: number; currentValue: number; pnl: number; pnlPct: number; dayChange: number;
}
export interface Order {
  id: number; symbol: string; company: string; type: 'BUY' | 'SELL';
  quantity: number; price: number; total: number; createdAt: string;
}
export interface Analytics {
  totalValue: number; holdingsValue: number; cash: number; invested: number; pnl: number; pnlPct: number;
  dayChange: number; dayChangePct: number;
  sectorAllocation: Record<string, number>;
  history: { date: string; value: number }[];
  topGainers: { symbol: string; pnl: number; pnlPct: number }[];
  topLosers: { symbol: string; pnl: number; pnlPct: number }[];
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH'; largestPositionPct: number; largestSectorPct: number;
  holdingsCount: number; sectorCount: number;
}
export interface Account { name: string; email: string; balance: number; }
export interface PortfolioHealth {
  overallScore: number; riskLevel: string;
  largestPositionPct: number; largestSectorPct: number;
  holdingsCount: number; sectorCount: number;
  scoreBreakdown: { component: string; score: number; maxScore: number; weight: number; explanation: string }[];
  sectorAllocation: Record<string, number>;
  warnings: string[];
}
export interface ShockItem { type: 'STOCK' | 'SECTOR' | 'MARKET'; target: string; pctChange: number; }
export interface ScenarioRequest { name: string; shocks: ShockItem[]; }
export interface ScenarioHoldingResult {
  symbol: string; company: string; sector: string; quantity: number;
  currentPrice: number; shockedPrice: number; currentValue: number; shockedValue: number;
  impactAmount: number; impactPct: number;
}
export interface ScenarioResult {
  name: string; currentPortfolioValue: number; shockedPortfolioValue: number; cashBalance: number;
  impactAmount: number; impactPct: number;
  holdingImpacts: ScenarioHoldingResult[];
  sectorImpacts: Record<string, number>;
}
export interface ScenarioSummary { id: number; name: string; estimatedPortfolioValue: number; estimatedPnl: number; createdAt: string; }
export interface TradeLensMetrics {
  totalOrders: number; buyOrders: number; sellOrders: number;
  grossBuyValue: number; grossSellValue: number; totalCharges: number;
  netRealizedPnl: number; chargesAsGainPct: number;
  pnlByStock: { symbol: string; company: string; totalBought: number; totalSold: number; realizedPnl: number; tradeCount: number }[];
  pnlBySector: { sector: string; realizedPnl: number; tradeCount: number }[];
  insights: string[];
}
export interface JournalEntry {
  id: number; relatedOrderId: number | null; strategy: string; entryNotes: string;
  exitNotes: string; observations: string; createdAt: string; updatedAt: string;
}
export interface NotificationItem {
  id: number; title: string; message: string; type: string;
  relatedRoute: string; isRead: boolean; createdAt: string;
}
export interface UserSettings { currency: string; tradeConfirmation: boolean; riskAlerts: boolean; tradeAlerts: boolean; }
