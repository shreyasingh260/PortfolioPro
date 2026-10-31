import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule, CurrencyPipe, DecimalPipe, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataService } from '../../data.service';
import { TradeLensMetrics, JournalEntry } from '../../models';

@Component({
  selector: 'app-tradelens',
  standalone: true,
  imports: [CommonModule, FormsModule, CurrencyPipe, DecimalPipe, DatePipe],
  template: `
    <div class="tradelens-page">
      <div class="page-header" style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 12px;">
        <div>
          <h1 class="page-title">TradeLens — Trading Behaviour Analyzer</h1>
          <p class="page-subtitle">Reflective trading analytics, trade journal entries, and deterministic behavioral insights</p>
        </div>
        <button class="btn btn-primary btn-sm" (click)="openJournalForm()">+ Add Journal Entry</button>
      </div>

      <!-- Performance Metrics KPI Grid -->
      <div class="kpi-grid" style="margin-bottom: 20px;">
        <div class="card">
          <div class="card-label">Total Completed Trades</div>
          <div class="card-value">{{ metrics()?.totalOrders ?? 0 }}</div>
          <div class="card-sub">{{ metrics()?.buyOrders ?? 0 }} Buys • {{ metrics()?.sellOrders ?? 0 }} Sells</div>
        </div>

        <div class="card">
          <div class="card-label">Net Realized P&amp;L</div>
          <div class="card-value" [class.gain]="(metrics()?.netRealizedPnl ?? 0) >= 0" [class.loss]="(metrics()?.netRealizedPnl ?? 0) < 0">
            {{ (metrics()?.netRealizedPnl ?? 0) >= 0 ? '+' : '' }}{{ metrics()?.netRealizedPnl ?? 0 | currency:'INR':'symbol':'1.2-2' }}
          </div>
          <div class="card-sub">From closed position transactions</div>
        </div>

        <div class="card">
          <div class="card-label">Total Simulated Charges</div>
          <div class="card-value">{{ metrics()?.totalCharges ?? 0 | currency:'INR':'symbol':'1.2-2' }}</div>
          <div class="card-sub">0.1% transaction friction</div>
        </div>

        <div class="card">
          <div class="card-label">Charges / Realized Gains</div>
          <div class="card-value" [class.loss]="(metrics()?.chargesAsGainPct ?? 0) > 15">
            {{ metrics()?.chargesAsGainPct ?? 0 | number:'1.1-1' }}%
          </div>
          <div class="card-sub">Friction cost ratio</div>
        </div>
      </div>

      <!-- Behavioral Insights Section -->
      <div class="section" style="margin-top: 10px; margin-bottom: 20px;">
        <h3 class="section-title">Deterministic Behavioral Insights</h3>
        @if (metrics() && metrics()!.insights.length > 0) {
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 12px; margin-top: 10px;">
            @for (insight of metrics()!.insights; track insight) {
              <div class="card" style="border-left: 4px solid var(--primary); padding: 14px;">
                <div style="display: flex; gap: 10px; align-items: flex-start;">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" stroke-width="2" style="flex-shrink: 0; margin-top: 2px;">
                    <circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>
                  </svg>
                  <p style="font-size: 13px; color: var(--text); margin: 0; line-height: 1.5;">{{ insight }}</p>
                </div>
              </div>
            }
          </div>
        } @else {
          <div class="empty-state" style="padding: 20px;">
            <p>Execute more buy and sell transactions in TradeLab to generate behavioral telemetry.</p>
          </div>
        }
      </div>

      <!-- Trade Journal Form Modal / Slide-down -->
      @if (showJournalModal) {
        <div class="card" style="border: 2px solid var(--primary); margin-bottom: 24px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px;">
            <h3 style="font-size: 15px; font-weight: 700; color: var(--text);">
              {{ editingJournalId ? 'Edit Trade Journal Entry' : 'New Trade Journal Entry' }}
            </h3>
            <button class="btn btn-ghost btn-sm" (click)="closeJournalForm()">✕ Cancel</button>
          </div>

          <form (ngSubmit)="saveJournal()">
            <div class="grid-2">
              <div class="form-group">
                <label for="jStrategy">Trading Strategy</label>
                <select id="jStrategy" [(ngModel)]="journalForm.strategy" name="strategy">
                  <option value="Momentum">Momentum Breakout</option>
                  <option value="Value Investing">Value Investing</option>
                  <option value="Swing Trade">Swing Trade</option>
                  <option value="Growth">Growth</option>
                  <option value="Technical Trend">Technical Trend</option>
                </select>
              </div>

              <div class="form-group">
                <label for="jObservations">Personal Observations</label>
                <input id="jObservations" type="text" [(ngModel)]="journalForm.observations" name="observations" placeholder="e.g. Volume surge, MACD crossover" />
              </div>
            </div>

            <div class="form-group">
              <label for="jEntry">Entry Rationale</label>
              <textarea id="jEntry" [(ngModel)]="journalForm.entryNotes" name="entryNotes" placeholder="Why did you execute this trade? What thesis did you test?" required></textarea>
            </div>

            <div class="form-group">
              <label for="jExit">Exit Thoughts / Post-Trade Review</label>
              <textarea id="jExit" [(ngModel)]="journalForm.exitNotes" name="exitNotes" placeholder="Lessons learned, target hit, stop-loss maintained..."></textarea>
            </div>

            <div style="display: flex; gap: 10px;">
              <button type="submit" class="btn btn-primary" [disabled]="savingJournal()">
                {{ editingJournalId ? 'Update Entry' : 'Save Entry' }}
              </button>
              <button type="button" class="btn btn-ghost" (click)="closeJournalForm()">Cancel</button>
            </div>
          </form>
        </div>
      }

      <!-- Trade Journal Entries List -->
      <div class="section">
        <div class="section-header">
          <h3 class="section-title">Trading Journal ({{ journalEntries().length }} Entries)</h3>
          <span style="font-size: 12px; color: var(--muted);">Recorded rationales and reflective notes</span>
        </div>

        @if (journalEntries().length === 0) {
          <div class="empty-state">
            <h3>Your trading journal is empty</h3>
            <p>Maintain notes on your entry thesis and trade review to improve disciplined execution.</p>
            <button class="btn btn-primary btn-sm" style="margin-top: 10px;" (click)="openJournalForm()">Write First Entry</button>
          </div>
        } @else {
          <div style="display: flex; flex-direction: column; gap: 12px;">
            @for (j of journalEntries(); track j.id) {
              <div class="card">
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px;">
                  <div>
                    <span class="badge badge-blue" style="margin-right: 8px;">{{ j.strategy }}</span>
                    <span style="font-size: 12px; color: var(--muted);">{{ j.createdAt | date:'mediumDate' }}</span>
                  </div>
                  <div style="display: flex; gap: 6px;">
                    <button class="btn btn-ghost btn-sm" style="padding: 2px 8px; font-size: 11px;" (click)="editJournal(j)">Edit</button>
                    <button class="btn btn-ghost btn-sm" style="color: var(--red); padding: 2px 8px; font-size: 11px;" (click)="deleteJournal(j.id)">Delete</button>
                  </div>
                </div>

                <div style="font-size: 13.5px; color: var(--text); line-height: 1.5; margin-bottom: 6px;">
                  <strong>Entry Thesis:</strong> {{ j.entryNotes }}
                </div>

                @if (j.exitNotes) {
                  <div style="font-size: 13px; color: var(--muted); line-height: 1.5; margin-bottom: 6px;">
                    <strong>Exit Review:</strong> {{ j.exitNotes }}
                  </div>
                }

                @if (j.observations) {
                  <div style="font-size: 12px; color: var(--primary); line-height: 1.4;">
                    <em>Observations: {{ j.observations }}</em>
                  </div>
                }
              </div>
            }
          </div>
        }
      </div>

      <!-- P&L by Stock and Sector Analysis Tables -->
      @if (metrics() && metrics()!.pnlByStock.length > 0) {
        <div class="grid-2" style="margin-top: 24px;">
          <!-- PnL by Stock -->
          <div>
            <div class="section-header">
              <h3 class="section-title">Performance by Stock</h3>
            </div>
            <div class="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Symbol</th>
                    <th class="right">Bought</th>
                    <th class="right">Sold</th>
                    <th class="right">Realized P&amp;L</th>
                  </tr>
                </thead>
                <tbody>
                  @for (s of metrics()!.pnlByStock; track s.symbol) {
                    <tr>
                      <td><strong>{{ s.symbol }}</strong></td>
                      <td class="right">{{ s.totalBought | currency:'INR':'symbol':'1.0-0' }}</td>
                      <td class="right">{{ s.totalSold | currency:'INR':'symbol':'1.0-0' }}</td>
                      <td class="right" [class.gain]="s.realizedPnl >= 0" [class.loss]="s.realizedPnl < 0">
                        <strong>{{ s.realizedPnl >= 0 ? '+' : '' }}{{ s.realizedPnl | currency:'INR':'symbol':'1.0-0' }}</strong>
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          </div>

          <!-- PnL by Sector -->
          <div>
            <div class="section-header">
              <h3 class="section-title">Performance by Industry Sector</h3>
            </div>
            <div class="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Sector</th>
                    <th class="right">Trades</th>
                    <th class="right">Realized P&amp;L</th>
                  </tr>
                </thead>
                <tbody>
                  @for (sec of metrics()!.pnlBySector; track sec.sector) {
                    <tr>
                      <td><strong>{{ sec.sector }}</strong></td>
                      <td class="right">{{ sec.tradeCount }}</td>
                      <td class="right" [class.gain]="sec.realizedPnl >= 0" [class.loss]="sec.realizedPnl < 0">
                        <strong>{{ sec.realizedPnl >= 0 ? '+' : '' }}{{ sec.realizedPnl | currency:'INR':'symbol':'1.0-0' }}</strong>
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          </div>
        </div>
      }
    </div>
  `
})
export class TradelensComponent implements OnInit {
  private dataService = inject(DataService);

  metrics = signal<TradeLensMetrics | null>(null);
  journalEntries = signal<JournalEntry[]>([]);

  showJournalModal = false;
  editingJournalId: number | null = null;
  savingJournal = signal(false);

  journalForm = {
    strategy: 'Momentum',
    entryNotes: '',
    exitNotes: '',
    observations: ''
  };

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.dataService.tradeLensMetrics().subscribe({
      next: m => this.metrics.set(m)
    });
    this.dataService.journalEntries().subscribe({
      next: j => this.journalEntries.set(j)
    });
  }

  openJournalForm() {
    this.editingJournalId = null;
    this.journalForm = { strategy: 'Momentum', entryNotes: '', exitNotes: '', observations: '' };
    this.showJournalModal = true;
  }

  editJournal(j: JournalEntry) {
    this.editingJournalId = j.id;
    this.journalForm = {
      strategy: j.strategy,
      entryNotes: j.entryNotes,
      exitNotes: j.exitNotes || '',
      observations: j.observations || ''
    };
    this.showJournalModal = true;
  }

  closeJournalForm() {
    this.showJournalModal = false;
    this.editingJournalId = null;
  }

  saveJournal() {
    if (!this.journalForm.entryNotes.trim()) return;
    this.savingJournal.set(true);

    if (this.editingJournalId) {
      this.dataService.updateJournalEntry(this.editingJournalId, this.journalForm).subscribe({
        next: () => {
          this.savingJournal.set(false);
          this.closeJournalForm();
          this.loadData();
        },
        error: () => this.savingJournal.set(false)
      });
    } else {
      this.dataService.createJournalEntry(this.journalForm).subscribe({
        next: () => {
          this.savingJournal.set(false);
          this.closeJournalForm();
          this.loadData();
        },
        error: () => this.savingJournal.set(false)
      });
    }
  }

  deleteJournal(id: number) {
    this.dataService.deleteJournalEntry(id).subscribe({
      next: () => this.loadData()
    });
  }
}
