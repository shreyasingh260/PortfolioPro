import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule, CurrencyPipe, DecimalPipe, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { forkJoin } from 'rxjs';
import { DataService } from '../../data.service';
import { Stock, Holding, Order, Account } from '../../models';

@Component({
  selector: 'app-tradelab',
  standalone: true,
  imports: [CommonModule, FormsModule, CurrencyPipe, DecimalPipe, DatePipe],
  template: `
    <div class="tradelab-page">
      <div class="page-header">
        <h1 class="page-title">TradeLab — Paper Trading Engine</h1>
        <p class="page-subtitle">Execute virtual trades in real-time with simulated Indian equity market prices</p>
      </div>

      <!-- Virtual Wallet KPI Bar -->
      <div class="kpi-grid" style="margin-bottom: 20px;">
        <div class="card">
          <div class="card-label">Available Virtual Cash</div>
          <div class="card-value">{{ account()?.balance ?? 0 | currency:'INR':'symbol':'1.2-2' }}</div>
          <div class="card-sub">Liquid purchasing power</div>
        </div>

        <div class="card">
          <div class="card-label">Total Invested Cost</div>
          <div class="card-value">{{ totalInvested() | currency:'INR':'symbol':'1.2-2' }}</div>
          <div class="card-sub">{{ holdings().length }} position(s) held</div>
        </div>

        <div class="card">
          <div class="card-label">Current Holdings Value</div>
          <div class="card-value">{{ currentHoldingsValue() | currency:'INR':'symbol':'1.2-2' }}</div>
          <div class="card-sub">Market valuation at latest quotes</div>
        </div>

        <div class="card">
          <div class="card-label">Unrealized P&amp;L</div>
          <div class="card-value" [class.gain]="totalPnl() >= 0" [class.loss]="totalPnl() < 0">
            {{ totalPnl() >= 0 ? '+' : '' }}{{ totalPnl() | currency:'INR':'symbol':'1.2-2' }}
          </div>
          <div class="card-sub" [class.gain]="totalPnlPct() >= 0" [class.loss]="totalPnlPct() < 0">
            {{ totalPnlPct() >= 0 ? '+' : '' }}{{ totalPnlPct() | number:'1.2-2' }}%
          </div>
        </div>
      </div>

      <!-- Trade Execution Form & Stock Details -->
      <div class="grid-2">
        <!-- Trade Order Terminal -->
        <div class="card">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
            <h3 style="font-size: 15px; font-weight: 700; color: var(--text);">Order Execution Terminal</h3>
            <span class="badge badge-blue">Zero-Risk Simulation</span>
          </div>

          @if (tradeSuccess()) {
            <div class="alert alert-success">{{ tradeSuccess() }}</div>
          }
          @if (tradeError()) {
            <div class="alert alert-error">{{ tradeError() }}</div>
          }

          <form (ngSubmit)="submitTrade()">
            <!-- Stock Selection -->
            <div class="form-group">
              <label for="stockSelect">Selected Stock</label>
              <select id="stockSelect" [(ngModel)]="selectedSymbol" name="selectedSymbol" (change)="onStockChanged()">
                @for (s of stocks(); track s.symbol) {
                  <option [value]="s.symbol">
                    {{ s.symbol }} — {{ s.company }} (₹{{ s.price | number:'1.2-2' }})
                  </option>
                }
              </select>
            </div>

            <!-- Buy / Sell Toggle Tabs -->
            <div class="form-group">
              <label>Order Action</label>
              <div style="display: flex; gap: 8px;">
                <button
                  type="button"
                  class="btn"
                  [class.btn-success]="orderType === 'BUY'"
                  [class.btn-ghost]="orderType !== 'BUY'"
                  style="flex: 1; padding: 10px;"
                  (click)="orderType = 'BUY'"
                >
                  BUY
                </button>
                <button
                  type="button"
                  class="btn"
                  [class.btn-danger]="orderType === 'SELL'"
                  [class.btn-ghost]="orderType !== 'SELL'"
                  style="flex: 1; padding: 10px;"
                  (click)="orderType = 'SELL'"
                >
                  SELL
                </button>
              </div>
            </div>

            <!-- Quantity Input -->
            <div class="form-group">
              <label for="quantity">Number of Shares (Qty)</label>
              <input
                id="quantity"
                type="number"
                min="1"
                step="1"
                [(ngModel)]="quantity"
                name="quantity"
                placeholder="Enter quantity..."
                required
              />
              <div class="form-hint" style="display: flex; justify-content: space-between; margin-top: 4px;">
                <span>Shares in portfolio: <strong>{{ currentStockHoldingQty() }}</strong></span>
                @if (orderType === 'SELL' && currentStockHoldingQty() > 0) {
                  <a href="javascript:void(0)" (click)="quantity = currentStockHoldingQty()" style="font-size: 11px;">
                    Sell All ({{ currentStockHoldingQty() }})
                  </a>
                }
              </div>
            </div>

            <!-- Order Cost Breakdown Table -->
            <div style="background: var(--bg); border: 1px solid var(--border); border-radius: 8px; padding: 12px; margin-bottom: 16px;">
              <div class="wallet-row">
                <span class="wallet-label">Execution Price (Demo)</span>
                <span class="wallet-value">{{ activeStock()?.price ?? 0 | currency:'INR':'symbol':'1.2-2' }}</span>
              </div>
              <div class="wallet-row">
                <span class="wallet-label">Gross Order Value</span>
                <span class="wallet-value">{{ estimatedGross() | currency:'INR':'symbol':'1.2-2' }}</span>
              </div>
              <div class="wallet-row">
                <span class="wallet-label">Simulated Charges (0.1%)</span>
                <span class="wallet-value">{{ estimatedCharges() | currency:'INR':'symbol':'1.2-2' }}</span>
              </div>
              <div class="wallet-row" style="border-top: 1.5px solid var(--border); margin-top: 6px; padding-top: 8px;">
                <span class="wallet-label" style="font-weight: 700; color: var(--text);">
                  {{ orderType === 'BUY' ? 'Total Cash Required' : 'Estimated Net Proceeds' }}
                </span>
                <span class="wallet-value" style="font-size: 16px; font-weight: 700; color: var(--primary);">
                  {{ estimatedNet() | currency:'INR':'symbol':'1.2-2' }}
                </span>
              </div>
            </div>

            <button
              type="submit"
              class="btn btn-primary"
              style="width: 100%; padding: 12px;"
              [disabled]="executing() || quantity <= 0"
            >
              @if (executing()) {
                <span class="spinner" style="width: 16px; height: 16px; border-width: 2px;"></span>
              }
              Confirm &amp; Execute {{ orderType }} Order
            </button>
          </form>
        </div>

        <!-- Stock Details & Analysis Card -->
        <div class="card" style="display: flex; flex-direction: column;">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 14px;">
            <div>
              <span class="badge badge-gray" style="margin-bottom: 4px;">{{ activeStock()?.sector }}</span>
              <h2 style="font-size: 20px; font-weight: 700; color: var(--text);">{{ activeStock()?.symbol }}</h2>
              <p style="font-size: 13px; color: var(--muted);">{{ activeStock()?.company }}</p>
            </div>
            <div style="text-align: right;">
              <div style="font-size: 22px; font-weight: 700; color: var(--text);">
                {{ activeStock()?.price ?? 0 | currency:'INR':'symbol':'1.2-2' }}
              </div>
              <div [class.gain]="(activeStock()?.changePct ?? 0) >= 0" [class.loss]="(activeStock()?.changePct ?? 0) < 0" style="font-size: 12px; font-weight: 600;">
                {{ (activeStock()?.changePct ?? 0) >= 0 ? '+' : '' }}{{ activeStock()?.changePct ?? 0 | number:'1.2-2' }}% Today
              </div>
            </div>
          </div>

          <div style="border-top: 1px solid var(--border); padding-top: 14px; margin-bottom: 14px;">
            <div class="wallet-row">
              <span class="wallet-label">Previous Day Close</span>
              <span class="wallet-value">{{ activeStock()?.prevClose ?? 0 | currency:'INR':'symbol':'1.2-2' }}</span>
            </div>
            <div class="wallet-row">
              <span class="wallet-label">P/E Ratio</span>
              <span class="wallet-value">{{ activeStock()?.peRatio ?? 0 | number:'1.1-1' }}</span>
            </div>
            <div class="wallet-row">
              <span class="wallet-label">20-Day Simple Moving Avg (SMA)</span>
              <span class="wallet-value">{{ activeStock()?.sma20 ?? 0 | currency:'INR':'symbol':'1.2-2' }}</span>
            </div>
            <div class="wallet-row">
              <span class="wallet-label">Technical Trend Indicator</span>
              <span>
                <span class="badge" [class.badge-green]="activeStock()?.trend === 'ABOVE'" [class.badge-red]="activeStock()?.trend === 'BELOW'">
                  {{ activeStock()?.trend }} SMA-20
                </span>
              </span>
            </div>
          </div>

          <!-- Existing Position Box -->
          <div style="background: #F4F8FD; border: 1px solid var(--border); border-radius: 8px; padding: 14px; margin-top: auto;">
            <h4 style="font-size: 13px; font-weight: 600; color: var(--text); margin-bottom: 8px;">Your Current Position</h4>
            @if (activeHolding()) {
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 12.5px;">
                <div>Qty: <strong>{{ activeHolding()!.quantity }} shares</strong></div>
                <div>Avg Cost: <strong>{{ activeHolding()!.avgPrice | currency:'INR':'symbol':'1.2-2' }}</strong></div>
                <div>Invested: <strong>{{ activeHolding()!.invested | currency:'INR':'symbol':'1.0-0' }}</strong></div>
                <div>
                  P&amp;L:
                  <strong [class.gain]="activeHolding()!.pnl >= 0" [class.loss]="activeHolding()!.pnl < 0">
                    {{ activeHolding()!.pnl >= 0 ? '+' : '' }}{{ activeHolding()!.pnl | currency:'INR':'symbol':'1.0-0' }}
                    ({{ activeHolding()!.pnlPct | number:'1.1-1' }}%)
                  </strong>
                </div>
              </div>
            } @else {
              <p style="font-size: 12px; color: var(--muted); margin: 0;">You do not currently own shares of {{ activeStock()?.symbol }}.</p>
            }
          </div>
        </div>
      </div>

      <!-- Searchable Stock Universe Table -->
      <div class="section" style="margin-top: 24px;">
        <div class="section-header">
          <div>
            <h3 class="section-title">Stock Universe ({{ filteredStocks().length }} Stocks)</h3>
            <span style="font-size: 12px; color: var(--muted);">Click any row to load into order terminal</span>
          </div>
          <div style="max-width: 240px; width: 100%;">
            <input
              type="text"
              placeholder="Filter by symbol, name, or sector..."
              [(ngModel)]="stockFilter"
              style="padding: 6px 10px; font-size: 12px;"
            />
          </div>
        </div>

        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Symbol</th>
                <th>Company Name</th>
                <th>Sector</th>
                <th class="right">Price (₹)</th>
                <th class="right">Prev Close (₹)</th>
                <th class="right">Day Change</th>
                <th class="right">P/E</th>
                <th class="center">Trend</th>
                <th class="center">Action</th>
              </tr>
            </thead>
            <tbody>
              @for (s of filteredStocks(); track s.symbol) {
                <tr (click)="selectStock(s)" style="cursor: pointer;" [style.background]="s.symbol === selectedSymbol ? '#EDF3FF' : ''">
                  <td><strong>{{ s.symbol }}</strong></td>
                  <td>{{ s.company }}</td>
                  <td><span class="badge badge-gray">{{ s.sector }}</span></td>
                  <td class="right"><strong>{{ s.price | currency:'INR':'symbol':'1.2-2' }}</strong></td>
                  <td class="right">{{ s.prevClose | currency:'INR':'symbol':'1.2-2' }}</td>
                  <td class="right" [class.gain]="s.changePct >= 0" [class.loss]="s.changePct < 0">
                    {{ s.changePct >= 0 ? '+' : '' }}{{ s.changePct | number:'1.2-2' }}%
                  </td>
                  <td class="right">{{ s.peRatio | number:'1.1-1' }}</td>
                  <td class="center">
                    <span class="badge" [class.badge-green]="s.trend === 'ABOVE'" [class.badge-red]="s.trend === 'BELOW'" style="font-size: 10px;">
                      {{ s.trend }}
                    </span>
                  </td>
                  <td class="center">
                    <button class="btn btn-outline btn-sm" style="padding: 2px 8px; font-size: 11px;" (click)="selectStock(s); $event.stopPropagation();">
                      Select
                    </button>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>

      <!-- Execution History -->
      <div class="section" style="margin-top: 24px;">
        <div class="section-header">
          <h3 class="section-title">Transaction History</h3>
          <span style="font-size: 12px; color: var(--muted);">Authoritative ledger of executed orders</span>
        </div>
        <div class="table-wrap">
          @if (orders().length === 0) {
            <div class="empty-state">
              <p>No orders executed yet.</p>
            </div>
          } @else {
            <table>
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Timestamp</th>
                  <th>Stock</th>
                  <th>Action</th>
                  <th class="right">Quantity</th>
                  <th class="right">Execution Price</th>
                  <th class="right">Gross Value</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                @for (o of orders(); track o.id) {
                  <tr>
                    <td>#{{ o.id }}</td>
                    <td>{{ o.createdAt | date:'short' }}</td>
                    <td><strong>{{ o.symbol }}</strong> — {{ o.company }}</td>
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
    </div>
  `
})
export class TradelabComponent implements OnInit {
  private dataService = inject(DataService);
  private route = inject(ActivatedRoute);

  stocks = signal<Stock[]>([]);
  holdings = signal<Holding[]>([]);
  orders = signal<Order[]>([]);
  account = signal<Account | null>(null);

  selectedSymbol = 'TCS';
  orderType: 'BUY' | 'SELL' = 'BUY';
  quantity = 10;
  stockFilter = '';

  executing = signal(false);
  tradeSuccess = signal('');
  tradeError = signal('');

  ngOnInit() {
    this.loadData();
    this.route.queryParams.subscribe(params => {
      if (params['stock']) {
        this.selectedSymbol = params['stock'];
      }
      if (params['q']) {
        this.stockFilter = params['q'];
      }
    });
  }

  loadData() {
    forkJoin({
      stocks: this.dataService.stocks(),
      holdings: this.dataService.holdings(),
      orders: this.dataService.orders(),
      account: this.dataService.account()
    }).subscribe({
      next: res => {
        this.stocks.set(res.stocks);
        this.holdings.set(res.holdings);
        this.orders.set(res.orders);
        this.account.set(res.account);
        if (res.stocks.length > 0 && !this.selectedSymbol) {
          this.selectedSymbol = res.stocks[0].symbol;
        }
      }
    });
  }

  filteredStocks(): Stock[] {
    const q = this.stockFilter.toLowerCase().trim();
    if (!q) return this.stocks();
    return this.stocks().filter(s =>
      s.symbol.toLowerCase().includes(q) ||
      s.company.toLowerCase().includes(q) ||
      s.sector.toLowerCase().includes(q)
    );
  }

  activeStock(): Stock | undefined {
    return this.stocks().find(s => s.symbol === this.selectedSymbol);
  }

  activeHolding(): Holding | undefined {
    return this.holdings().find(h => h.symbol === this.selectedSymbol);
  }

  currentStockHoldingQty(): number {
    return this.activeHolding()?.quantity ?? 0;
  }

  selectStock(s: Stock) {
    this.selectedSymbol = s.symbol;
    this.tradeSuccess.set('');
    this.tradeError.set('');
  }

  onStockChanged() {
    this.tradeSuccess.set('');
    this.tradeError.set('');
  }

  estimatedGross(): number {
    const p = this.activeStock()?.price ?? 0;
    return p * Math.max(0, this.quantity);
  }

  estimatedCharges(): number {
    return this.estimatedGross() * 0.001; // 0.1% simulated charges
  }

  estimatedNet(): number {
    if (this.orderType === 'BUY') {
      return this.estimatedGross() + this.estimatedCharges();
    } else {
      return Math.max(0, this.estimatedGross() - this.estimatedCharges());
    }
  }

  totalInvested(): number {
    return this.holdings().reduce((sum, h) => sum + h.invested, 0);
  }

  currentHoldingsValue(): number {
    return this.holdings().reduce((sum, h) => sum + h.currentValue, 0);
  }

  totalPnl(): number {
    return this.currentHoldingsValue() - this.totalInvested();
  }

  totalPnlPct(): number {
    const inv = this.totalInvested();
    return inv > 0 ? (this.totalPnl() / inv) * 100 : 0;
  }

  submitTrade() {
    this.tradeSuccess.set('');
    this.tradeError.set('');

    if (this.quantity <= 0) {
      this.tradeError.set('Quantity must be at least 1.');
      return;
    }

    if (this.orderType === 'SELL' && this.currentStockHoldingQty() < this.quantity) {
      this.tradeError.set(`Cannot sell ${this.quantity} shares. You only own ${this.currentStockHoldingQty()} shares.`);
      return;
    }

    if (this.orderType === 'BUY' && (this.account()?.balance ?? 0) < this.estimatedNet()) {
      this.tradeError.set('Insufficient available virtual cash for this purchase.');
      return;
    }

    this.executing.set(true);

    this.dataService.trade({
      symbol: this.selectedSymbol,
      type: this.orderType,
      quantity: this.quantity
    }).subscribe({
      next: order => {
        this.executing.set(false);
        this.tradeSuccess.set(`Successfully executed ${this.orderType} order for ${order.quantity} shares of ${order.symbol} at ₹${order.price.toFixed(2)}.`);
        this.loadData();
      },
      error: err => {
        this.executing.set(false);
        this.tradeError.set(err.error?.message || 'Trade execution failed. Check portfolio constraints.');
      }
    });
  }
}
