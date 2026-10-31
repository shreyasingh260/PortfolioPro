import { Component, OnInit, inject } from '@angular/core';
import { CurrencyPipe, DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { DataService, Holding } from '../data.service';

@Component({
  selector: 'app-portfolio',
  standalone: true,
  imports: [CurrencyPipe, DecimalPipe, RouterLink],
  template: `
    <main class="page">
      <h1>Portfolio</h1>
      <p class="sub">Every stock you hold, with profit and loss against your average buy price.</p>

      @if (error) { <p class="error" role="alert">{{ error }}</p> }

      @if (loaded && !holdings.length) {
        <div class="empty">You do not hold any stocks. <a routerLink="/market">Browse the market</a> to place a trade.</div>
      }

      @if (holdings.length) {
        <div class="table-wrap">
          <table>
            <thead><tr>
              <th>Stock</th><th>Sector</th><th class="num">Qty</th><th class="num">Avg price</th>
              <th class="num">Price</th><th class="num">Invested</th><th class="num">Value</th>
              <th class="num">P&amp;L</th><th class="num">P&amp;L %</th>
            </tr></thead>
            <tbody>
              @for (h of holdings; track h.symbol) {
                <tr>
                  <td><b>{{ h.symbol }}</b><br><span class="muted small">{{ h.company }}</span></td>
                  <td>{{ h.sector }}</td>
                  <td class="num">{{ h.quantity }}</td>
                  <td class="num">{{ h.avgPrice | currency:'INR':'symbol':'1.2-2' }}</td>
                  <td class="num">{{ h.price | currency:'INR':'symbol':'1.2-2' }}</td>
                  <td class="num">{{ h.invested | currency:'INR':'symbol':'1.0-0' }}</td>
                  <td class="num">{{ h.currentValue | currency:'INR':'symbol':'1.0-0' }}</td>
                  <td class="num" [class.gain]="h.pnl >= 0" [class.loss]="h.pnl < 0">{{ h.pnl | currency:'INR':'symbol':'1.0-0' }}</td>
                  <td class="num" [class.gain]="h.pnl >= 0" [class.loss]="h.pnl < 0">{{ h.pnlPct | number:'1.2-2' }}%</td>
                </tr>
              }
            </tbody>
            <tfoot>
              <tr>
                <td colspan="5"><b>Total</b></td>
                <td class="num">{{ totalInvested | currency:'INR':'symbol':'1.0-0' }}</td>
                <td class="num">{{ totalValue | currency:'INR':'symbol':'1.0-0' }}</td>
                <td class="num" [class.gain]="totalPnl >= 0" [class.loss]="totalPnl < 0">{{ totalPnl | currency:'INR':'symbol':'1.0-0' }}</td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>
      }
    </main>
  `
})
export class PortfolioComponent implements OnInit {
  private api = inject(DataService);
  holdings: Holding[] = [];
  loaded = false;
  error = '';

  ngOnInit() {
    this.api.portfolio().subscribe({
      next: h => { this.holdings = h; this.loaded = true; },
      error: () => (this.error = 'Could not load your portfolio. Check that the backend is running.')
    });
  }

  get totalInvested() { return this.holdings.reduce((a, h) => a + h.invested, 0); }
  get totalValue() { return this.holdings.reduce((a, h) => a + h.currentValue, 0); }
  get totalPnl() { return this.totalValue - this.totalInvested; }
}
