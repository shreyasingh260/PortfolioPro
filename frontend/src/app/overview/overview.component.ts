import { Component, OnInit, inject } from '@angular/core';
import { CurrencyPipe, DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { Analytics, DataService, Holding } from '../data.service';
import { AuthService } from '../auth/auth.service';
import { ChartComponent } from '../shared/chart.component';

@Component({
  selector: 'app-overview',
  standalone: true,
  imports: [CurrencyPipe, DecimalPipe, RouterLink, ChartComponent],
  template: `
    <main class="page">
      <h1>Welcome back, {{ auth.name() }}</h1>
      <p class="sub">Prices in this app are sample data, not live market quotes.</p>

      @if (error) { <p class="error" role="alert">{{ error }}</p> }

      @if (data) {
        <h2>Holdings summary</h2>
        @if (holdings.length) {
          <div class="table-wrap">
            <table>
              <thead><tr>
                <th>Stock</th><th class="num">Qty</th><th class="num">Avg price</th>
                <th class="num">Price</th><th class="num">Value</th><th class="num">P&amp;L</th>
              </tr></thead>
              <tbody>
                @for (h of holdings.slice(0, 5); track h.symbol) {
                  <tr>
                    <td><b>{{ h.symbol }}</b> <span class="muted">{{ h.sector }}</span></td>
                    <td class="num">{{ h.quantity }}</td>
                    <td class="num">{{ h.avgPrice | currency:'INR':'symbol':'1.2-2' }}</td>
                    <td class="num">{{ h.price | currency:'INR':'symbol':'1.2-2' }}</td>
                    <td class="num">{{ h.currentValue | currency:'INR':'symbol':'1.0-0' }}</td>
                    <td class="num" [class.gain]="h.pnl >= 0" [class.loss]="h.pnl < 0">
                      {{ h.pnlPct | number:'1.2-2' }}%
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
          @if (holdings.length > 5) { <p class="more"><a routerLink="/portfolio">See all {{ holdings.length }} holdings</a></p> }
        } @else {
          <div class="empty">
            You have no holdings yet. <a routerLink="/market">Browse the market</a> and place your first trade.
          </div>
        }

        <section class="analytics" aria-labelledby="analytics-title">
          <h2 id="analytics-title">Analytics</h2>

          <div class="cards">
            <div class="card">
              <span class="label">Total value</span>
              <b class="big">{{ data.totalValue | currency:'INR':'symbol':'1.0-0' }}</b>
              <span class="muted">Cash plus holdings</span>
            </div>
            <div class="card">
              <span class="label">Invested</span>
              <b class="big">{{ data.invested | currency:'INR':'symbol':'1.0-0' }}</b>
              <span class="muted">Cash available {{ data.cash | currency:'INR':'symbol':'1.0-0' }}</span>
            </div>
            <div class="card">
              <span class="label">Total P&amp;L</span>
              <b class="big" [class.gain]="data.pnl >= 0" [class.loss]="data.pnl < 0">
                {{ data.pnl | currency:'INR':'symbol':'1.0-0' }}
              </b>
              <span [class.gain]="data.pnl >= 0" [class.loss]="data.pnl < 0">{{ data.pnlPct | number:'1.2-2' }}%</span>
            </div>
            <div class="card">
              <span class="label">Today's change</span>
              <b class="big" [class.gain]="data.dayChange >= 0" [class.loss]="data.dayChange < 0">
                {{ data.dayChange | currency:'INR':'symbol':'1.0-0' }}
              </b>
              <span [class.gain]="data.dayChange >= 0" [class.loss]="data.dayChange < 0">{{ data.dayChangePct | number:'1.2-2' }}%</span>
            </div>
          </div>

          <div class="grid-2">
            <div class="panel">
              <h3>Allocation by sector</h3>
              @if (sectorLabels.length) {
                <div class="chart-box"><app-chart type="doughnut" [labels]="sectorLabels" [values]="sectorValues" label="Value" /></div>
              } @else { <p class="muted">Your sector split appears after your first buy.</p> }
            </div>
            <div class="panel">
              <h3>Portfolio value over time</h3>
              <div class="chart-box"><app-chart type="line" [labels]="historyLabels" [values]="historyValues" label="Total value" /></div>
            </div>
          </div>

          <div class="grid-3">
            <div class="panel">
              <h3>Top gainers</h3>
              @for (g of data.topGainers; track g.symbol) {
                <div class="row"><b>{{ g.symbol }}</b><span class="gain">+{{ g.pnlPct | number:'1.2-2' }}%</span></div>
              } @empty { <p class="muted">No holdings are in profit.</p> }
            </div>
            <div class="panel">
              <h3>Top losers</h3>
              @for (l of data.topLosers; track l.symbol) {
                <div class="row"><b>{{ l.symbol }}</b><span class="loss">{{ l.pnlPct | number:'1.2-2' }}%</span></div>
              } @empty { <p class="muted">No holdings are at a loss.</p> }
            </div>
            <div class="panel">
              <h3>Risk</h3>
              <p><span class="badge" [class]="'badge risk-' + data.riskLevel">{{ riskLabel }}</span></p>
              <div class="row"><span>Largest position</span><b>{{ data.largestPositionPct | number:'1.0-1' }}%</b></div>
              <div class="row"><span>Largest sector</span><b>{{ data.largestSectorPct | number:'1.0-1' }}%</b></div>
              <div class="row"><span>Holdings / sectors</span><b>{{ data.holdingsCount }} / {{ data.sectorCount }}</b></div>
              <p class="muted small">{{ riskText }}</p>
            </div>
          </div>
        </section>
      }
    </main>
  `
})
export class OverviewComponent implements OnInit {
  private api = inject(DataService);
  auth = inject(AuthService);

  data?: Analytics;
  holdings: Holding[] = [];
  error = '';
  sectorLabels: string[] = [];
  sectorValues: number[] = [];
  historyLabels: string[] = [];
  historyValues: number[] = [];

  ngOnInit() {
    forkJoin({ a: this.api.analytics(), h: this.api.portfolio() }).subscribe({
      next: ({ a, h }) => {
        this.holdings = h;
        this.sectorLabels = Object.keys(a.sectorAllocation);
        this.sectorValues = Object.values(a.sectorAllocation);
        this.historyLabels = a.history.map(p => new Date(p.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }));
        this.historyValues = a.history.map(p => p.value);
        this.data = a;
      },
      error: () => (this.error = 'Could not load your overview. Check that the backend is running.')
    });
  }

  get riskLabel() {
    const r = this.data?.riskLevel;
    return r === 'HIGH' ? 'High risk' : r === 'MEDIUM' ? 'Medium risk' : 'Low risk';
  }

  get riskText() {
    const d = this.data!;
    if (!d.holdingsCount) return 'Risk is scored once you hold stocks.';
    if (d.riskLevel === 'HIGH') return 'One stock is over 40% of your holdings, or one sector is over 60%. Consider spreading out.';
    if (d.riskLevel === 'MEDIUM') return 'One stock is over 25% of your holdings, or one sector is over 40%.';
    return 'No single stock is over 25% and no sector is over 40% of your holdings.';
  }
}
