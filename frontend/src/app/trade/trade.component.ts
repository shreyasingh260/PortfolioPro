import { Component, OnInit, inject } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { forkJoin } from 'rxjs';
import { DataService, Holding, Order, Stock } from '../data.service';

@Component({
  selector: 'app-trade',
  standalone: true,
  imports: [CurrencyPipe, DatePipe, FormsModule],
  template: `
    <main class="page">
      <h1>Trade</h1>
      <p class="sub">Orders run at the current price. Cash available: <b>{{ balance | currency:'INR':'symbol':'1.2-2' }}</b></p>

      <form class="panel trade-form" (ngSubmit)="submit()">
        <div class="field">
          <label for="symbol">Stock</label>
          <select id="symbol" name="symbol" [(ngModel)]="symbol">
            @for (s of stocks; track s.symbol) {
              <option [value]="s.symbol">{{ s.symbol }} - {{ s.company }}</option>
            }
          </select>
        </div>

        <fieldset class="field">
          <legend>Order type</legend>
          <label class="radio"><input type="radio" name="type" value="BUY" [(ngModel)]="type"> Buy</label>
          <label class="radio"><input type="radio" name="type" value="SELL" [(ngModel)]="type"> Sell</label>
        </fieldset>

        <div class="field">
          <label for="qty">Quantity</label>
          <input id="qty" name="qty" type="number" min="1" step="1" [(ngModel)]="quantity">
        </div>

        <div class="summary">
          <div class="row"><span>Price</span><b>{{ selected ? (selected.price | currency:'INR':'symbol':'1.2-2') : '-' }}</b></div>
          <div class="row"><span>Estimated total</span><b>{{ total | currency:'INR':'symbol':'1.2-2' }}</b></div>
          <div class="row"><span>You own</span><b>{{ owned }} shares</b></div>
        </div>

        @if (error) { <p class="error" role="alert">{{ error }}</p> }
        @if (success) { <p class="success" role="status">{{ success }}</p> }

        <button class="btn" type="submit" [disabled]="busy || !selected || quantity < 1">
          {{ busy ? 'Placing order...' : (type === 'BUY' ? 'Buy' : 'Sell') + ' ' + (symbol || 'stock') }}
        </button>
      </form>

      <h2>Order history</h2>
      <div class="table-wrap">
        <table>
          <thead><tr><th>Date</th><th>Stock</th><th>Type</th><th class="num">Qty</th><th class="num">Price</th><th class="num">Total</th></tr></thead>
          <tbody>
            @for (o of orders; track o.id) {
              <tr>
                <td>{{ o.createdAt | date:'d MMM y, h:mm a' }}</td>
                <td><b>{{ o.symbol }}</b></td>
                <td><span class="tag" [class.up]="o.type === 'BUY'" [class.down]="o.type === 'SELL'">{{ o.type === 'BUY' ? 'Buy' : 'Sell' }}</span></td>
                <td class="num">{{ o.quantity }}</td>
                <td class="num">{{ o.price | currency:'INR':'symbol':'1.2-2' }}</td>
                <td class="num">{{ o.total | currency:'INR':'symbol':'1.2-2' }}</td>
              </tr>
            } @empty {
              <tr><td colspan="6" class="muted">No orders yet. Your trades will be listed here.</td></tr>
            }
          </tbody>
        </table>
      </div>
    </main>
  `
})
export class TradeComponent implements OnInit {
  private api = inject(DataService);
  private route = inject(ActivatedRoute);

  stocks: Stock[] = [];
  holdings: Holding[] = [];
  orders: Order[] = [];
  balance = 0;
  symbol = '';
  type: 'BUY' | 'SELL' = 'BUY';
  quantity = 1;
  busy = false;
  error = '';
  success = '';

  ngOnInit() {
    this.load(true);
  }

  private load(first = false) {
    forkJoin({
      s: this.api.stocks(), h: this.api.portfolio(), o: this.api.orders(), a: this.api.account()
    }).subscribe({
      next: ({ s, h, o, a }) => {
        this.stocks = s; this.holdings = h; this.orders = o; this.balance = a.balance;
        if (first) {
          const wanted = this.route.snapshot.queryParamMap.get('symbol');
          this.symbol = s.some(x => x.symbol === wanted) ? wanted! : (s[0]?.symbol ?? '');
        }
      },
      error: () => (this.error = 'Could not load trading data. Check that the backend is running.')
    });
  }

  get selected(): Stock | undefined { return this.stocks.find(s => s.symbol === this.symbol); }
  get total(): number { return (this.selected?.price ?? 0) * (this.quantity || 0); }
  get owned(): number { return this.holdings.find(h => h.symbol === this.symbol)?.quantity ?? 0; }

  submit() {
    this.error = ''; this.success = ''; this.busy = true;
    const body = { symbol: this.symbol, type: this.type, quantity: this.quantity };
    this.api.trade(body).subscribe({
      next: o => {
        this.busy = false;
        this.success = `${o.type === 'BUY' ? 'Bought' : 'Sold'} ${o.quantity} ${o.symbol} at ₹${o.price.toFixed(2)}.`;
        this.load();
      },
      error: e => {
        this.busy = false;
        this.error = e.error?.message ?? 'The order could not be placed.';
      }
    });
  }
}
