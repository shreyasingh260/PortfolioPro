import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { API } from './api';
import {
  Stock,
  Holding,
  Order,
  Analytics,
  Account,
  PortfolioHealth,
  ScenarioRequest,
  ScenarioResult,
  ScenarioSummary,
  TradeLensMetrics,
  JournalEntry,
  NotificationItem,
  UserSettings
} from './models';

@Injectable({ providedIn: 'root' })
export class DataService {
  private http = inject(HttpClient);

  // Stocks
  stocks(search?: string) {
    let params = new HttpParams();
    if (search) params = params.set('q', search);
    return this.http.get<Stock[]>(`${API}/stocks`, { params });
  }

  stockBySymbol(symbol: string) {
    return this.http.get<Stock>(`${API}/stocks/${symbol}`);
  }

  // Portfolio & Account
  holdings() {
    return this.http.get<Holding[]>(`${API}/portfolio`);
  }

  account() {
    return this.http.get<Account>(`${API}/account`);
  }

  orders() {
    return this.http.get<Order[]>(`${API}/orders`);
  }

  // Trading
  trade(body: { symbol: string; type: 'BUY' | 'SELL'; quantity: number }) {
    return this.http.post<Order>(`${API}/trade`, body);
  }

  // Analytics Overview
  analytics() {
    return this.http.get<Analytics>(`${API}/analytics/overview`);
  }

  // Dashboard APIs
  dashboardSummary() {
    return this.http.get<any>(`${API}/dashboard/summary`);
  }

  dashboardPerformance() {
    return this.http.get<{ date: string; value: number }[]>(`${API}/dashboard/performance`);
  }

  marketWatch() {
    return this.http.get<Stock[]>(`${API}/dashboard/market-watch`);
  }

  // Portfolio Health
  portfolioHealth() {
    return this.http.get<PortfolioHealth>(`${API}/portfolio-health/summary`);
  }

  // Market Shock Lab
  previewScenario(req: ScenarioRequest) {
    return this.http.post<ScenarioResult>(`${API}/scenarios/preview`, req);
  }

  saveScenario(req: ScenarioRequest) {
    return this.http.post<ScenarioSummary>(`${API}/scenarios`, req);
  }

  listScenarios() {
    return this.http.get<ScenarioSummary[]>(`${API}/scenarios`);
  }

  deleteScenario(id: number) {
    return this.http.delete(`${API}/scenarios/${id}`);
  }

  // TradeLens
  tradeLensMetrics() {
    return this.http.get<TradeLensMetrics>(`${API}/tradelens/summary`);
  }

  journalEntries() {
    return this.http.get<JournalEntry[]>(`${API}/tradelens/journal`);
  }

  createJournalEntry(data: Partial<JournalEntry>) {
    return this.http.post<JournalEntry>(`${API}/tradelens/journal`, data);
  }

  updateJournalEntry(id: number, data: Partial<JournalEntry>) {
    return this.http.put<JournalEntry>(`${API}/tradelens/journal/${id}`, data);
  }

  deleteJournalEntry(id: number) {
    return this.http.delete(`${API}/tradelens/journal/${id}`);
  }

  // Notifications
  notifications() {
    return this.http.get<NotificationItem[]>(`${API}/notifications`);
  }

  unreadCount() {
    return this.http.get<{ count: number }>(`${API}/notifications/unread-count`);
  }

  markNotifRead(id: number) {
    return this.http.patch<NotificationItem>(`${API}/notifications/${id}/read`, {});
  }

  // Settings
  getSettings() {
    return this.http.get<UserSettings>(`${API}/settings`);
  }

  updateSettings(settings: UserSettings) {
    return this.http.put<UserSettings>(`${API}/settings`, settings);
  }
}
