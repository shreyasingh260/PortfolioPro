import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule, CurrencyPipe, DecimalPipe, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataService } from '../../data.service';
import { ScenarioRequest, ScenarioResult, ScenarioSummary, ShockItem, Stock } from '../../models';

@Component({
  selector: 'app-market-shock-lab',
  standalone: true,
  imports: [CommonModule, FormsModule, CurrencyPipe, DecimalPipe, DatePipe],
  template: `
    <div class="shock-lab-page">
      <div class="page-header" style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 12px;">
        <div>
          <h1 class="page-title">Market Shock Lab</h1>
          <p class="page-subtitle">Stress-test your portfolio against hypothetical market downturns and sector crashes</p>
        </div>
        <span class="badge badge-amber" style="padding: 6px 12px; font-size: 12px;">
          Non-Destructive Simulation — Real Holdings Untouched
        </span>
      </div>

      <!-- Presets Selector Grid -->
      <div class="section-header">
        <h3 class="section-title">Hypothetical Stress Test Presets</h3>
      </div>
      <div class="shock-preset-grid">
        <div
          class="shock-preset-btn"
          [class.selected]="selectedPreset === 'MILD_CORRECTION'"
          (click)="applyPreset('MILD_CORRECTION', 'Mild Correction (-10%)', [{ type: 'MARKET', target: 'ALL', pctChange: -10 }])"
        >
          <div class="preset-name">Mild Market Correction</div>
          <div class="preset-desc">Broad market index declines by 10%</div>
          <div class="preset-impact">-10.0% All Stocks</div>
        </div>

        <div
          class="shock-preset-btn"
          [class.selected]="selectedPreset === 'MAJOR_CRASH'"
          (click)="applyPreset('MAJOR_CRASH', 'Black Swan Crash (-30%)', [{ type: 'MARKET', target: 'ALL', pctChange: -30 }])"
        >
          <div class="preset-name">Black Swan Market Crash</div>
          <div class="preset-desc">Severe systemic liquidity shock</div>
          <div class="preset-impact">-30.0% All Stocks</div>
        </div>

        <div
          class="shock-preset-btn"
          [class.selected]="selectedPreset === 'TECH_CRASH'"
          (click)="applyPreset('TECH_CRASH', 'Tech Sector Meltdown (-25%)', [{ type: 'SECTOR', target: 'IT', pctChange: -25 }])"
        >
          <div class="preset-name">IT Sector Meltdown</div>
          <div class="preset-desc">Tech valuation contraction</div>
          <div class="preset-impact">-25.0% IT Equities</div>
        </div>

        <div
          class="shock-preset-btn"
          [class.selected]="selectedPreset === 'BANKING_CRISIS'"
          (click)="applyPreset('BANKING_CRISIS', 'Banking Sector Crisis (-20%)', [{ type: 'SECTOR', target: 'Banking', pctChange: -20 }])"
        >
          <div class="preset-name">Banking Sector Crisis</div>
          <div class="preset-desc">Credit spread widening &amp; rate shock</div>
          <div class="preset-impact">-20.0% Banking Equities</div>
        </div>
      </div>

      <!-- Custom Scenario Builder & Result Cards -->
      <div class="grid-2" style="margin-top: 10px;">
        <!-- Configurator Card -->
        <div class="card">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
            <h3 style="font-size: 15px; font-weight: 700; color: var(--text);">Scenario Configuration</h3>
            <button class="btn btn-ghost btn-sm" (click)="addShockRow()">+ Add Custom Shock</button>
          </div>

          <div class="form-group">
            <label for="scName">Scenario Name</label>
            <input id="scName" type="text" [(ngModel)]="scenarioName" placeholder="e.g. Rate Hike & IT Selloff" />
          </div>

          <div style="margin-bottom: 14px;">
            <label>Shock Parameters</label>
            @for (item of shocks; track $index) {
              <div class="shock-row">
                <div style="flex: 1.2;">
                  <label style="font-size: 11px; margin-bottom: 2px;">Scope</label>
                  <select [(ngModel)]="item.type" (change)="onScopeChanged(item)" style="padding: 6px 8px; font-size: 12px;">
                    <option value="MARKET">Market-Wide</option>
                    <option value="SECTOR">Sector</option>
                    <option value="STOCK">Single Stock</option>
                  </select>
                </div>

                <div style="flex: 1.5;">
                  <label style="font-size: 11px; margin-bottom: 2px;">Target</label>
                  @if (item.type === 'MARKET') {
                    <input type="text" [value]="'All Equities'" disabled style="padding: 6px 8px; font-size: 12px; background: #EEE;" />
                  } @else if (item.type === 'SECTOR') {
                    <select [(ngModel)]="item.target" style="padding: 6px 8px; font-size: 12px;">
                      <option value="IT">IT</option>
                      <option value="Banking">Banking</option>
                      <option value="Energy">Energy</option>
                      <option value="Pharma">Pharma</option>
                      <option value="FMCG">FMCG</option>
                    </select>
                  } @else {
                    <select [(ngModel)]="item.target" style="padding: 6px 8px; font-size: 12px;">
                      @for (s of availableStocks(); track s.symbol) {
                        <option [value]="s.symbol">{{ s.symbol }}</option>
                      }
                    </select>
                  }
                </div>

                <div style="flex: 1.2;">
                  <label style="font-size: 11px; margin-bottom: 2px;">Impact %</label>
                  <input
                    type="number"
                    [(ngModel)]="item.pctChange"
                    step="1"
                    placeholder="-15"
                    style="padding: 6px 8px; font-size: 12px;"
                  />
                </div>

                @if (shocks.length > 1) {
                  <button
                    class="btn btn-ghost btn-sm"
                    style="color: var(--red); padding: 6px 8px;"
                    (click)="removeShockRow($index)"
                    title="Remove"
                  >
                    ✕
                  </button>
                }
              </div>
            }
          </div>

          <div style="display: flex; gap: 10px; margin-top: 14px;">
            <button class="btn btn-primary" style="flex: 1;" (click)="runSimulation()" [disabled]="simulating()">
              @if (simulating()) {
                <span class="spinner" style="width: 14px; height: 14px; border-width: 2px;"></span>
              }
              Simulate Scenario
            </button>
            <button
              class="btn btn-outline"
              (click)="saveCurrentScenario()"
              [disabled]="saving() || !simulationResult()"
            >
              Save Scenario
            </button>
          </div>

          @if (saveSuccess()) {
            <div class="alert alert-success" style="margin-top: 10px;">{{ saveSuccess() }}</div>
          }
        </div>

        <!-- Simulation Results KPI Summary -->
        <div class="card" style="display: flex; flex-direction: column;">
          <h3 style="font-size: 15px; font-weight: 700; color: var(--text); margin-bottom: 12px;">Simulated Portfolio Impact</h3>

          @if (simulationResult()) {
            <div class="wallet-row">
              <span class="wallet-label">Current Total Portfolio</span>
              <span class="wallet-value">{{ simulationResult()!.currentPortfolioValue | currency:'INR':'symbol':'1.0-0' }}</span>
            </div>
            <div class="wallet-row">
              <span class="wallet-label">Hypothetical Shocked Value</span>
              <span class="wallet-value" style="font-size: 18px; color: var(--text); font-weight: 700;">
                {{ simulationResult()!.shockedPortfolioValue | currency:'INR':'symbol':'1.0-0' }}
              </span>
            </div>
            <div class="wallet-row">
              <span class="wallet-label">Unchanged Cash Cushion</span>
              <span class="wallet-value">{{ simulationResult()!.cashBalance | currency:'INR':'symbol':'1.0-0' }}</span>
            </div>
            <div class="wallet-row">
              <span class="wallet-label">Simulated Net Impact (₹)</span>
              <span class="wallet-value" [class.gain]="simulationResult()!.impactAmount >= 0" [class.loss]="simulationResult()!.impactAmount < 0">
                <strong>
                  {{ simulationResult()!.impactAmount >= 0 ? '+' : '' }}{{ simulationResult()!.impactAmount | currency:'INR':'symbol':'1.0-0' }}
                </strong>
              </span>
            </div>
            <div class="wallet-row" style="border-bottom: 0;">
              <span class="wallet-label">Simulated Drawdown (%)</span>
              <span class="wallet-value" [class.gain]="simulationResult()!.impactPct >= 0" [class.loss]="simulationResult()!.impactPct < 0">
                <span class="badge" [class.badge-red]="simulationResult()!.impactPct < 0" [class.badge-green]="simulationResult()!.impactPct >= 0" style="font-size: 13px;">
                  {{ simulationResult()!.impactPct >= 0 ? '+' : '' }}{{ simulationResult()!.impactPct | number:'1.2-2' }}%
                </span>
              </span>
            </div>

            <!-- Sector Loss Contribution -->
            <div style="background: var(--bg); border: 1px solid var(--border); border-radius: 8px; padding: 12px; margin-top: auto;">
              <h4 style="font-size: 12.5px; font-weight: 600; color: var(--text); margin-bottom: 6px;">Sector Impact Contribution</h4>
              @for (entry of sectorImpactList(); track entry.sector) {
                <div style="display: flex; justify-content: space-between; font-size: 12px; padding: 3px 0;">
                  <span>{{ entry.sector }}</span>
                  <span [class.loss]="entry.impact < 0" [class.gain]="entry.impact >= 0">
                    {{ entry.impact | currency:'INR':'symbol':'1.0-0' }}
                  </span>
                </div>
              }
            </div>
          } @else {
            <div class="empty-state" style="margin: auto 0;">
              <h3>No Simulation Run Yet</h3>
              <p>Select a preset shock or configure custom percentage shocks and click "Simulate Scenario".</p>
            </div>
          }
        </div>
      </div>

      <!-- Holding-Level Breakdown Table -->
      @if (simulationResult() && simulationResult()!.holdingImpacts.length > 0) {
        <div class="section" style="margin-top: 24px;">
          <div class="section-header">
            <h3 class="section-title">Per-Holding Stress Impact Breakdown</h3>
            <span style="font-size: 12px; color: var(--muted);">Authoritative calculation: Shock Price = Current Price × (1 + Shock% / 100)</span>
          </div>
          <div class="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Stock</th>
                  <th>Sector</th>
                  <th class="right">Qty</th>
                  <th class="right">Current Price</th>
                  <th class="right">Shocked Price</th>
                  <th class="right">Current Value</th>
                  <th class="right">Shocked Value</th>
                  <th class="right">P&amp;L Impact</th>
                </tr>
              </thead>
              <tbody>
                @for (h of simulationResult()!.holdingImpacts; track h.symbol) {
                  <tr>
                    <td><strong>{{ h.symbol }}</strong> <span style="font-size: 11px; color: var(--muted)">{{ h.company }}</span></td>
                    <td><span class="badge badge-gray">{{ h.sector }}</span></td>
                    <td class="right">{{ h.quantity }}</td>
                    <td class="right">{{ h.currentPrice | currency:'INR':'symbol':'1.2-2' }}</td>
                    <td class="right" [class.loss]="h.shockedPrice < h.currentPrice" [class.gain]="h.shockedPrice > h.currentPrice">
                      <strong>{{ h.shockedPrice | currency:'INR':'symbol':'1.2-2' }}</strong>
                    </td>
                    <td class="right">{{ h.currentValue | currency:'INR':'symbol':'1.0-0' }}</td>
                    <td class="right">{{ h.shockedValue | currency:'INR':'symbol':'1.0-0' }}</td>
                    <td class="right" [class.gain]="h.impactAmount >= 0" [class.loss]="h.impactAmount < 0">
                      <strong>{{ h.impactAmount >= 0 ? '+' : '' }}{{ h.impactAmount | currency:'INR':'symbol':'1.0-0' }}</strong>
                      <span style="display: block; font-size: 11px;">({{ h.impactPct >= 0 ? '+' : '' }}{{ h.impactPct | number:'1.2-2' }}%)</span>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      }

      <!-- Saved Scenarios Library -->
      <div class="section" style="margin-top: 24px;">
        <div class="section-header">
          <h3 class="section-title">Saved Scenario Library</h3>
          <span style="font-size: 12px; color: var(--muted);">Persisted stress scenarios for this account</span>
        </div>
        <div class="table-wrap">
          @if (savedScenarios().length === 0) {
            <div class="empty-state">
              <p>No scenarios saved yet. Run a stress test above and click "Save Scenario".</p>
            </div>
          } @else {
            <table>
              <thead>
                <tr>
                  <th>Scenario Name</th>
                  <th>Created At</th>
                  <th class="right">Estimated Shocked Value</th>
                  <th class="right">Estimated Impact</th>
                  <th class="center">Action</th>
                </tr>
              </thead>
              <tbody>
                @for (s of savedScenarios(); track s.id) {
                  <tr>
                    <td><strong>{{ s.name }}</strong></td>
                    <td>{{ s.createdAt | date:'mediumDate' }}</td>
                    <td class="right"><strong>{{ s.estimatedPortfolioValue | currency:'INR':'symbol':'1.0-0' }}</strong></td>
                    <td class="right" [class.gain]="s.estimatedPnl >= 0" [class.loss]="s.estimatedPnl < 0">
                      {{ s.estimatedPnl >= 0 ? '+' : '' }}{{ s.estimatedPnl | currency:'INR':'symbol':'1.0-0' }}
                    </td>
                    <td class="center">
                      <button class="btn btn-ghost btn-sm" style="color: var(--red); padding: 2px 8px; font-size: 11px;" (click)="deleteScenario(s.id)">
                        Delete
                      </button>
                    </td>
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
export class MarketShockLabComponent implements OnInit {
  private dataService = inject(DataService);

  availableStocks = signal<Stock[]>([]);
  savedScenarios = signal<ScenarioSummary[]>([]);
  simulationResult = signal<ScenarioResult | null>(null);

  scenarioName = 'Mild Market Correction (-10%)';
  selectedPreset = 'MILD_CORRECTION';
  shocks: ShockItem[] = [{ type: 'MARKET', target: 'ALL', pctChange: -10 }];

  simulating = signal(false);
  saving = signal(false);
  saveSuccess = signal('');

  ngOnInit() {
    this.loadStocksAndSaved();
    this.runSimulation(); // auto-simulate the default preset
  }

  loadStocksAndSaved() {
    this.dataService.stocks().subscribe({
      next: s => this.availableStocks.set(s)
    });
    this.dataService.listScenarios().subscribe({
      next: sc => this.savedScenarios.set(sc)
    });
  }

  applyPreset(presetKey: string, name: string, items: ShockItem[]) {
    this.selectedPreset = presetKey;
    this.scenarioName = name;
    this.shocks = JSON.parse(JSON.stringify(items));
    this.saveSuccess.set('');
    this.runSimulation();
  }

  addShockRow() {
    this.selectedPreset = 'CUSTOM';
    this.shocks.push({ type: 'SECTOR', target: 'IT', pctChange: -15 });
  }

  removeShockRow(index: number) {
    if (this.shocks.length > 1) {
      this.shocks.splice(index, 1);
    }
  }

  onScopeChanged(item: ShockItem) {
    if (item.type === 'MARKET') item.target = 'ALL';
    else if (item.type === 'SECTOR') item.target = 'IT';
    else if (item.type === 'STOCK') item.target = this.availableStocks()[0]?.symbol ?? 'TCS';
  }

  runSimulation() {
    this.simulating.set(true);
    this.saveSuccess.set('');

    const req: ScenarioRequest = {
      name: this.scenarioName || 'Custom Shock Scenario',
      shocks: this.shocks
    };

    this.dataService.previewScenario(req).subscribe({
      next: result => {
        this.simulationResult.set(result);
        this.simulating.set(false);
      },
      error: () => this.simulating.set(false)
    });
  }

  saveCurrentScenario() {
    if (!this.simulationResult()) return;
    this.saving.set(true);
    this.saveSuccess.set('');

    const req: ScenarioRequest = {
      name: this.scenarioName,
      shocks: this.shocks
    };

    this.dataService.saveScenario(req).subscribe({
      next: () => {
        this.saving.set(false);
        this.saveSuccess.set(`Scenario "${this.scenarioName}" saved to your library.`);
        this.loadStocksAndSaved();
      },
      error: () => this.saving.set(false)
    });
  }

  deleteScenario(id: number) {
    this.dataService.deleteScenario(id).subscribe({
      next: () => this.loadStocksAndSaved()
    });
  }

  sectorImpactList(): { sector: string; impact: number }[] {
    const res = this.simulationResult();
    if (!res || !res.sectorImpacts) return [];
    return Object.entries(res.sectorImpacts).map(([sector, impact]) => ({ sector, impact }));
  }
}
