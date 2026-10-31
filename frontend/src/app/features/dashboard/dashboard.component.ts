import { Component, OnInit, ElementRef, ViewChild, AfterViewInit, OnDestroy, inject, signal } from '@angular/core';
import { CommonModule, CurrencyPipe, DecimalPipe, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { Chart, registerables } from 'chart.js';
import { DataService } from '../../data.service';
import { AuthService } from '../../auth/auth.service';
import { Stock, Holding, Order, Analytics, PortfolioHealth } from '../../models';

Chart.register(...registerables);

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, CurrencyPipe, DecimalPipe, DatePipe],
  template: `
    <div class="dashboard-page">
      <div class="page-header" style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 12px;">
        <div>
          <h1 class="page-title">Dashboard</h1>
          <p class="page-subtitle">Your complete portfolio overview, market intelligence and risk telemetry</p>
        </div>
        <div class="quick-actions">
          <a routerLink="/tradelab" class="btn btn-primary btn-sm">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Execute Trade
          </a>
          <a routerLink="/market-shock-lab" class="btn btn-outline btn-sm">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
            Run Shock Scenario
          </a>
          <a routerLink="/portfolio-health" class="btn btn-ghost btn-sm">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
            Health Doctor
          </a>
        </div>
      </div>

      @if (loading()) {
        <div class="loading">
          <div class="spinner"></div>
          <span>Loading portfolio intelligence...</span>
        </div>
      } @else if (error()) {
        <div class="alert alert-error">{{ error() }}</div>
      } @else {
        <!-- KPI Cards Grid -->
        <div class="kpi-grid">
          <div class="card">
            <div class="card-label">Total Portfolio Value</div>
            <div class="card-value">{{ analytics()?.totalValue ?? 0 | currency:'INR':'symbol':'1.0-0' }}</div>
            <div class="card-sub">
              Available Cash: <strong>{{ analytics()?.cash ?? 0 | currency:'INR':'symbol':'1.0-0' }}</strong>
            </div>
          </div>

          <div class="card">
            <div class="card-label">Total Invested Value</div>
            <div class="card-value">{{ analytics()?.invested ?? 0 | currency:'INR':'symbol':'1.0-0' }}</div>
            <div class="card-sub">{{ holdings().length }} Open Holding(s)</div>
          </div>

          <div class="card">
            <div class="card-label">Total Unrealized P&amp;L</div>
            <div class="card-value" [class.gain]="(analytics()?.pnl ?? 0) >= 0" [class.loss]="(analytics()?.pnl ?? 0) < 0">
              {{ (analytics()?.pnl ?? 0) >= 0 ? '+' : '' }}{{ analytics()?.pnl ?? 0 | currency:'INR':'symbol':'1.0-0' }}
            </div>
            <div class="card-sub" [class.gain]="(analytics()?.pnlPct ?? 0) >= 0" [class.loss]="(analytics()?.pnlPct ?? 0) < 0">
              {{ (analytics()?.pnlPct ?? 0) >= 0 ? '+' : '' }}{{ analytics()?.pnlPct ?? 0 | number:'1.2-2' }}% overall return
            </div>
          </div>

          <div class="card">
            <div class="card-label">Portfolio Health Score</div>
            <div style="display: flex; align-items: baseline; gap: 8px;">
              <span class="card-value" [style.color]="getHealthColor(health()?.overallScore ?? 0)">
                {{ health()?.overallScore ?? 0 }}<span style="font-size: 14px; font-weight: 500; color: var(--muted)">/100</span>
              </span>
              <span class="badge" [ngClass]="getHealthBadgeClass(health()?.riskLevel ?? 'LOW')">
                {{ health()?.riskLevel ?? 'LOW' }} RISK
              </span>
            </div>
            <div class="card-sub">
              Max Position: {{ health()?.largestPositionPct ?? 0 | number:'1.1-1' }}%
            </div>
          </div>
        </div>

        <!-- Charts Section: Line Performance & Sector Donut -->
        <div class="grid-2" style="margin-top: 18px;">
          <!-- Performance Chart Card -->
          <div class="card" style="display: flex; flex-direction: column;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
              <div>
                <h3 style="font-size: 14px; font-weight: 600; color: var(--text);">Portfolio Performance</h3>
                <span style="font-size: 11px; color: var(--muted);">Historical portfolio value snapshots</span>
              </div>
              <span class="badge badge-gray" style="font-size: 10px;">Simulated Snapshots</span>
            </div>
            <div style="position: relative; height: 260px; width: 100%;">
              <canvas #perfChart></canvas>
            </div>
          </div>

          <!-- Sector Allocation Card -->
          <div class="card" style="display: flex; flex-direction: column;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
              <div>
                <h3 style="font-size: 14px; font-weight: 600; color: var(--text);">Sector Exposure</h3>
                <span style="font-size: 11px; color: var(--muted);">Diversification across {{ health()?.sectorCount ?? 0 }} industry sector(s)</span>
              </div>
              <a routerLink="/portfolio-health" class="btn btn-ghost btn-sm" style="font-size: 11px; padding: 3px 8px;">View Analysis</a>
            </div>
            <div style="position: relative; height: 260px; width: 100%;">
              <canvas #sectorChart></canvas>
            </div>
          </div>
        </div>

        <!-- Tables Section: Top Holdings & Market Watch -->
        <div class="grid-2" style="margin-top: 20px;">
          <!-- Holdings Table -->
          <div>
            <div class="section-header">
              <h3 class="section-title">Current Holdings ({{ holdings().length }})</h3>
              <a routerLink="/tradelab" class="btn btn-ghost btn-sm">Trade All</a>
            </div>
            <div class="table-wrap">
              @if (holdings().length === 0) {
                <div class="empty-state">
                  <h3>No active holdings</h3>
                  <p>Open TradeLab to purchase your first virtual stocks.</p>
                  <a routerLink="/tradelab" class="btn btn-primary btn-sm" style="margin-top: 12px;">Start Trading</a>
                </div>
              } @else {
                <table>
                  <thead>
                    <tr>
                      <th>Stock</th>
                      <th class="right">Qty</th>
                      <th class="right">Avg Cost</th>
                      <th class="right">Price</th>
                      <th class="right">P&amp;L</th>
                    </tr>
                  </thead>
                  <tbody>
                    @for (h of holdings().slice(0, 5); track h.symbol) {
                      <tr>
                        <td>
                          <strong>{{ h.symbol }}</strong>
                          <span style="display: block; font-size: 11px; color: var(--muted)">{{ h.sector }}</span>
                        </td>
                        <td class="right">{{ h.quantity }}</td>
                        <td class="right">{{ h.avgPrice | currency:'INR':'symbol':'1.2-2' }}</td>
                        <td class="right">{{ h.price | currency:'INR':'symbol':'1.2-2' }}</td>
                        <td class="right" [class.gain]="h.pnl >= 0" [class.loss]="h.pnl < 0">
                          <strong>{{ h.pnl >= 0 ? '+' : '' }}{{ h.pnl | currency:'INR':'symbol':'1.0-0' }}</strong>
                          <span style="display: block; font-size: 11px;">
                            ({{ h.pnlPct >= 0 ? '+' : '' }}{{ h.pnlPct | number:'1.2-2' }}%)
                          </span>
                        </td>
                      </tr>
                    }
                  </tbody>
                </table>
              }
            </div>
          </div>

          <!-- Market Watch & Recent Activity -->
          <div>
            <div class="section-header">
              <h3 class="section-title">Market Watch</h3>
              <a routerLink="/tradelab" class="btn btn-ghost btn-sm">Stock Universe</a>
            </div>
            <div class="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Symbol</th>
                    <th>Company</th>
                    <th class="right">Price</th>
                    <th class="right">Day Chg</th>
                    <th class="center">Action</th>
                  </tr>
                </thead>
                <tbody>
                  @for (s of marketStocks().slice(0, 5); track s.symbol) {
                    <tr>
                      <td><strong>{{ s.symbol }}</strong></td>
                      <td style="max-width: 140px; overflow: hidden; text-overflow: ellipsis;">{{ s.company }}</td>
                      <td class="right">{{ s.price | currency:'INR':'symbol':'1.2-2' }}</td>
                      <td class="right" [class.gain]="s.changePct >= 0" [class.loss]="s.changePct < 0">
                        {{ s.changePct >= 0 ? '+' : '' }}{{ s.changePct | number:'1.2-2' }}%
                      </td>
                      <td class="center">
                        <a [routerLink]="['/tradelab']" [queryParams]="{ stock: s.symbol }" class="btn btn-outline btn-sm" style="padding: 2px 8px; font-size: 11px;">
                          Trade
                        </a>
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- Recent Trades List -->
        <div class="section" style="margin-top: 24px;">
          <div class="section-header">
            <h3 class="section-title">Recent Transactions</h3>
            <a routerLink="/tradelab" class="btn btn-ghost btn-sm">All Order History</a>
          </div>
          <div class="table-wrap">
            @if (recentOrders().length === 0) {
              <div class="empty-state">
                <p>No orders executed yet. Head to TradeLab to start virtual trading.</p>
              </div>
            } @else {
              <table>
                <thead>
                  <tr>
                    <th>Date &amp; Time</th>
                    <th>Stock</th>
                    <th>Type</th>
                    <th class="right">Quantity</th>
                    <th class="right">Exec Price</th>
                    <th class="right">Gross Total</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  @for (o of recentOrders().slice(0, 5); track o.id) {
                    <tr>
                      <td>{{ o.createdAt | date:'short' }}</td>
                      <td><strong>{{ o.symbol }}</strong> <span style="font-size: 11px; color: var(--muted)">{{ o.company }}</span></td>
                      <td>
                        <span class="badge" [class.badge-green]="o.type === 'BUY'" [class.badge-red]="o.type === 'SELL'">
                          {{ o.type }}
                        </span>
                      </td>
                      <td class="right">{{ o.quantity }}</td>
                      <td class="right">{{ o.price | currency:'INR':'symbol':'1.2-2' }}</td>
                      <td class="right"><strong>{{ o.total | currency:'INR':'symbol':'1.2-2' }}</strong></td>
                      <td><span class="badge badge-green">FILLED</span></td>
                    </tr>
                  }
                </tbody>
              </table>
            }
          </div>
        </div>

        <!-- Explainable Risk Summary Box -->
        @if (health() && health()!.warnings.length > 0) {
          <div class="card" style="margin-top: 24px; border-left: 4px solid var(--amber);">
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--amber)" stroke-width="2">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
              </svg>
              <h4 style="font-size: 13.5px; font-weight: 600; color: var(--text);">Risk &amp; Concentration Warnings</h4>
            </div>
            <ul style="margin: 0 0 0 24px; font-size: 13px; color: var(--muted); line-height: 1.6;">
              @for (w of health()!.warnings; track w) {
                <li>{{ w }}</li>
              }
            </ul>
          </div>
        }
      }
    </div>
  `
})
export class DashboardComponent implements OnInit, AfterViewInit, OnDestroy {
  private dataService = inject(DataService);
  auth = inject(AuthService);

  @ViewChild('perfChart') perfChartRef?: ElementRef<HTMLCanvasElement>;
  @ViewChild('sectorChart') sectorChartRef?: ElementRef<HTMLCanvasElement>;

  private perfChartInstance?: Chart;
  private sectorChartInstance?: Chart;

  loading = signal(true);
  error = signal('');

  analytics = signal<Analytics | null>(null);
  health = signal<PortfolioHealth | null>(null);
  holdings = signal<Holding[]>([]);
  recentOrders = signal<Order[]>([]);
  marketStocks = signal<Stock[]>([]);

  ngOnInit() {
    this.loadAllData();
  }

  ngAfterViewInit() {
    // Charts will initialize once data loads
  }

  ngOnDestroy() {
    this.perfChartInstance?.destroy();
    this.sectorChartInstance?.destroy();
  }

  loadAllData() {
    this.loading.set(true);
    this.error.set('');

    forkJoin({
      analytics: this.dataService.analytics(),
      health: this.dataService.portfolioHealth(),
      holdings: this.dataService.holdings(),
      orders: this.dataService.orders(),
      stocks: this.dataService.stocks()
    }).subscribe({
      next: res => {
        this.analytics.set(res.analytics);
        this.health.set(res.health);
        this.holdings.set(res.holdings);
        this.recentOrders.set(res.orders);
        this.marketStocks.set(res.stocks);
        this.loading.set(false);

        // Render charts after DOM updates
        setTimeout(() => this.renderCharts(), 50);
      },
      error: err => {
        this.error.set(err.error?.message || 'Failed to load portfolio dashboard data. Ensure backend is running.');
        this.loading.set(false);
      }
    });
  }

  private renderCharts() {
    const a = this.analytics();
    const h = this.health();

    // 1. Line Performance Chart
    if (this.perfChartRef && a && a.history) {
      this.perfChartInstance?.destroy();
      const labels = a.history.map(item => item.date);
      const values = a.history.map(item => item.value);

      this.perfChartInstance = new Chart(this.perfChartRef.nativeElement, {
        type: 'line',
        data: {
          labels: labels.length > 0 ? labels : ['Day 1', 'Day 2', 'Day 3', 'Today'],
          datasets: [{
            label: 'Portfolio Value (₹)',
            data: values.length > 0 ? values : [750000, 752000, 755000, a.totalValue],
            borderColor: '#1769E0',
            backgroundColor: 'rgba(23, 105, 224, 0.08)',
            borderWidth: 2,
            fill: true,
            tension: 0.35,
            pointRadius: 3,
            pointBackgroundColor: '#1769E0'
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: {
              callbacks: {
                label: ctx => `Value: ₹${Number(ctx.parsed.y).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`
              }
            }
          },
          scales: {
            x: { grid: { display: false } },
            y: {
              grid: { color: '#EAF0F8' },
              ticks: {
                callback: v => '₹' + Number(v).toLocaleString('en-IN', { maximumFractionDigits: 0 })
              }
            }
          }
        }
      });
    }

    // 2. Sector Donut Chart
    if (this.sectorChartRef && h && h.sectorAllocation) {
      this.sectorChartInstance?.destroy();
      const sectors = Object.keys(h.sectorAllocation);
      const percentages = Object.values(h.sectorAllocation);
      const palette = ['#1769E0', '#00A884', '#F5A623', '#E5484D', '#13B8B1', '#71839C', '#9061F9'];

      this.sectorChartInstance = new Chart(this.sectorChartRef.nativeElement, {
        type: 'doughnut',
        data: {
          labels: sectors.length > 0 ? sectors : ['Cash Reserve'],
          datasets: [{
            data: percentages.length > 0 ? percentages : [100],
            backgroundColor: palette.slice(0, Math.max(1, sectors.length)),
            borderWidth: 2,
            borderColor: '#FFFFFF'
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'right',
              labels: { boxWidth: 12, font: { size: 11 } }
            },
            tooltip: {
              callbacks: {
                label: ctx => ` ${ctx.label}: ${Number(ctx.parsed).toFixed(1)}%`
              }
            }
          },
          cutout: '65%'
        }
      });
    }
  }

  getHealthColor(score: number): string {
    if (score >= 70) return 'var(--green)';
    if (score >= 45) return 'var(--amber)';
    return 'var(--red)';
  }

  getHealthBadgeClass(riskLevel: string): string {
    if (riskLevel === 'LOW') return 'badge-green';
    if (riskLevel === 'MEDIUM') return 'badge-amber';
    return 'badge-red';
  }
}
