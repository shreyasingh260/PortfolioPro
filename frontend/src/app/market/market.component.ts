import { Component, OnInit, inject } from '@angular/core';
import { CurrencyPipe, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { DataService, Stock } from '../data.service';

@Component({
  selector: 'app-market',
  standalone: true,
  imports: [CurrencyPipe, DecimalPipe, FormsModule, RouterLink],
  template: `
    <main class="page">
      <h1>Market</h1>
      <p class="sub">Sample prices. P/E is a fundamental measure; the trend compares price with the 20-day average.</p>

      <label for="q" class="visually-hidden">Search stocks</label>
      <input id="q" class="search" placeholder="Search by symbol, company or sector" [(ngModel)]="query">

      @if (error) { <p class="error" role="alert">{{ error }}</p> }

      <div class="table-wrap">
        <table>
          <thead><tr>
            <th>Symbol</th><th>Company</th><th>Sector</th>
            <th class="num">Price</th><th class="num">Change</th><th class="num">P/E</th>
            <th>Trend</th><th></th>
          </tr></thead>
          <tbody>
            @for (s of filtered; track s.symbol) {
              <tr>
                <td><b>{{ s.symbol }}</b></td>
                <td>{{ s.company }}</td>
                <td>{{ s.sector }}</td>
                <td class="num">{{ s.price | currency:'INR':'symbol':'1.2-2' }}</td>
                <td class="num" [class.gain]="s.changePct >= 0" [class.loss]="s.changePct < 0">
                  {{ s.changePct | number:'1.2-2' }}%
                </td>
                <td class="num">{{ s.peRatio | number:'1.1-1' }}</td>
                <td><span class="tag" [class.up]="s.trend === 'ABOVE'" [class.down]="s.trend === 'BELOW'">
                  {{ s.trend === 'ABOVE' ? 'Above 20-day avg' : 'Below 20-day avg' }}</span></td>
                <td><a class="btn small" routerLink="/trade" [queryParams]="{ symbol: s.symbol }">Trade</a></td>
              </tr>
            } @empty {
              <tr><td colspan="8" class="muted">No stocks match "{{ query }}".</td></tr>
            }
          </tbody>
        </table>
      </div>
    </main>
  `
})
export class MarketComponent implements OnInit {
  private api = inject(DataService);
  stocks: Stock[] = [];
  query = '';
  error = '';

  ngOnInit() {
    this.api.stocks().subscribe({
      next: s => (this.stocks = s),
      error: () => (this.error = 'Could not load stocks. Check that the backend is running.')
    });
  }

  get filtered(): Stock[] {
    const q = this.query.trim().toLowerCase();
    if (!q) return this.stocks;
    return this.stocks.filter(s =>
      [s.symbol, s.company, s.sector].some(v => v.toLowerCase().includes(q)));
  }
}
