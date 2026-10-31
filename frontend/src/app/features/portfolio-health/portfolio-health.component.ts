import { Component, OnInit, ElementRef, ViewChild, AfterViewInit, OnDestroy, inject, signal } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Chart, registerables } from 'chart.js';
import { DataService } from '../../data.service';
import { PortfolioHealth } from '../../models';

Chart.register(...registerables);

@Component({
  selector: 'app-portfolio-health',
  standalone: true,
  imports: [CommonModule, RouterLink, DecimalPipe],
  template: `
    <div class="health-page">
      <div class="page-header" style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 12px;">
        <div>
          <h1 class="page-title">Portfolio Health Doctor</h1>
          <p class="page-subtitle">Explainable risk diagnosis, diversification metrics, and concentration telemetry</p>
        </div>
        <a routerLink="/tradelab" class="btn btn-outline btn-sm">Adjust Holdings in TradeLab</a>
      </div>

      @if (loading()) {
        <div class="loading">
          <div class="spinner"></div>
          <span>Analyzing portfolio health telemetry...</span>
        </div>
      } @else if (error()) {
        <div class="alert alert-error">{{ error() }}</div>
      } @else if (health()) {
        <!-- Overall Health Diagnostic Score Banner -->
        <div class="grid-3" style="margin-bottom: 20px;">
          <!-- Circular Health Score Card -->
          <div class="card" style="text-align: center; display: flex; flex-direction: column; justify-content: center;">
            <div class="score-circle" [ngClass]="getCircleClass(health()!.overallScore)">
              {{ health()!.overallScore }}
              <div class="score-label">/ 100</div>
            </div>
            <h3 style="font-size: 16px; font-weight: 700; color: var(--text);">Overall Health Index</h3>
            <p style="font-size: 12px; color: var(--muted); margin-top: 2px;">
              Rated: <strong [style.color]="getScoreColor(health()!.overallScore)">{{ health()!.riskLevel }} RISK</strong>
            </p>
          </div>

          <!-- Diagnostic Metrics Summary -->
          <div class="card">
            <h3 style="font-size: 14px; font-weight: 600; color: var(--text); margin-bottom: 12px;">Concentration Exposure</h3>
            <div class="wallet-row">
              <span class="wallet-label">Largest Position Exposure</span>
              <span class="wallet-value" [class.loss]="health()!.largestPositionPct > 35">
                {{ health()!.largestPositionPct | number:'1.1-1' }}%
              </span>
            </div>
            <div class="wallet-row">
              <span class="wallet-label">Largest Sector Concentration</span>
              <span class="wallet-value" [class.loss]="health()!.largestSectorPct > 45">
                {{ health()!.largestSectorPct | number:'1.1-1' }}%
              </span>
            </div>
            <div class="wallet-row">
              <span class="wallet-label">Total Distinct Equities</span>
              <span class="wallet-value">{{ health()!.holdingsCount }} stocks</span>
            </div>
            <div class="wallet-row">
              <span class="wallet-label">Distinct Industry Sectors</span>
              <span class="wallet-value">{{ health()!.sectorCount }} sectors</span>
            </div>
          </div>

          <!-- Risk Assessment Interpretation -->
          <div class="card" style="display: flex; flex-direction: column; justify-content: center;">
            <h3 style="font-size: 14px; font-weight: 600; color: var(--text); margin-bottom: 8px;">Diagnostic Summary</h3>
            @if (health()!.overallScore >= 70) {
              <div class="badge badge-green" style="align-self: flex-start; margin-bottom: 8px;">Well-Balanced Portfolio</div>
              <p style="font-size: 12.5px; color: var(--muted); line-height: 1.5;">
                Your investments are nicely distributed across multiple companies and sectors. Vulnerability to single-stock shocks is well contained.
              </p>
            } @else if (health()!.overallScore >= 45) {
              <div class="badge badge-amber" style="align-self: flex-start; margin-bottom: 8px;">Moderate Concentration</div>
              <p style="font-size: 12.5px; color: var(--muted); line-height: 1.5;">
                Your portfolio demonstrates moderate concentration in a single stock or sector. Consider diversifying to mitigate drawdown risk.
              </p>
            } @else {
              <div class="badge badge-red" style="align-self: flex-start; margin-bottom: 8px;">High Risk Concentration</div>
              <p style="font-size: 12.5px; color: var(--muted); line-height: 1.5;">
                Elevated concentration identified. A severe price drop in your top position or sector could produce severe drawdown.
              </p>
            }
          </div>
        </div>

        <!-- Score Components Breakdown & Sector Chart -->
        <div class="grid-2">
          <!-- Transparent Scoring Formula Breakdown -->
          <div class="card">
            <h3 style="font-size: 15px; font-weight: 700; color: var(--text); margin-bottom: 4px;">Scoring Model Telemetry</h3>
            <p style="font-size: 12px; color: var(--muted); margin-bottom: 16px;">
              Documented 100-point multi-factor model with weighted risk components
            </p>

            @for (comp of health()!.scoreBreakdown; track comp.component) {
              <div style="margin-bottom: 16px;">
                <div style="display: flex; justify-content: space-between; font-size: 13px; font-weight: 600;">
                  <span>{{ comp.component }}</span>
                  <span>{{ comp.score }} / {{ comp.maxScore }} pts</span>
                </div>
                <div class="progress-wrap">
                  <div
                    class="progress-fill"
                    [style.width.%]="(comp.score / comp.maxScore) * 100"
                    [style.background]="getBarColor((comp.score / comp.maxScore) * 100)"
                  ></div>
                </div>
                <div style="font-size: 11.5px; color: var(--muted); margin-top: 4px;">
                  {{ comp.explanation }}
                </div>
              </div>
            }
          </div>

          <!-- Sector Allocation Donut Chart -->
          <div class="card" style="display: flex; flex-direction: column;">
            <h3 style="font-size: 15px; font-weight: 700; color: var(--text); margin-bottom: 4px;">Sector Diversification</h3>
            <p style="font-size: 12px; color: var(--muted); margin-bottom: 12px;">Exposure weight across active industries</p>

            <div style="position: relative; height: 260px; width: 100%;">
              <canvas #sectorChart></canvas>
            </div>
          </div>
        </div>

        <!-- Explainable Warnings Section -->
        <div class="section" style="margin-top: 24px;">
          <h3 class="section-title">Explainable Risk Warnings</h3>
          @if (health()!.warnings.length === 0) {
            <div class="alert alert-success" style="margin-top: 10px;">
              No significant concentration or diversification warnings detected in your current portfolio.
            </div>
          } @else {
            <div style="display: flex; flex-direction: column; gap: 10px; margin-top: 10px;">
              @for (w of health()!.warnings; track w) {
                <div class="card" style="border-left: 4px solid var(--amber); padding: 14px;">
                  <div style="display: flex; align-items: flex-start; gap: 10px;">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--amber)" stroke-width="2" style="flex-shrink: 0; margin-top: 2px;">
                      <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                    </svg>
                    <div>
                      <strong style="font-size: 13.5px; color: var(--text);">Risk Telemetry Notice</strong>
                      <p style="font-size: 13px; color: var(--muted); margin-top: 2px; line-height: 1.5;">{{ w }}</p>
                    </div>
                  </div>
                </div>
              }
            </div>
          }
        </div>
      }
    </div>
  `
})
export class PortfolioHealthComponent implements OnInit, AfterViewInit, OnDestroy {
  private dataService = inject(DataService);

  @ViewChild('sectorChart') sectorChartRef?: ElementRef<HTMLCanvasElement>;
  private chartInstance?: Chart;

  health = signal<PortfolioHealth | null>(null);
  loading = signal(true);
  error = signal('');

  ngOnInit() {
    this.loadHealth();
  }

  ngAfterViewInit() {}

  ngOnDestroy() {
    this.chartInstance?.destroy();
  }

  loadHealth() {
    this.loading.set(true);
    this.error.set('');

    this.dataService.portfolioHealth().subscribe({
      next: h => {
        this.health.set(h);
        this.loading.set(false);
        setTimeout(() => this.renderSectorChart(), 50);
      },
      error: err => {
        this.error.set(err.error?.message || 'Failed to calculate portfolio health.');
        this.loading.set(false);
      }
    });
  }

  private renderSectorChart() {
    const h = this.health();
    if (this.sectorChartRef && h && h.sectorAllocation) {
      this.chartInstance?.destroy();
      const sectors = Object.keys(h.sectorAllocation);
      const values = Object.values(h.sectorAllocation);
      const palette = ['#1769E0', '#00A884', '#F5A623', '#E5484D', '#13B8B1', '#71839C', '#9061F9'];

      this.chartInstance = new Chart(this.sectorChartRef.nativeElement, {
        type: 'doughnut',
        data: {
          labels: sectors,
          datasets: [{
            data: values,
            backgroundColor: palette.slice(0, sectors.length),
            borderWidth: 2,
            borderColor: '#FFFFFF'
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { position: 'right' }
          },
          cutout: '60%'
        }
      });
    }
  }

  getCircleClass(score: number): string {
    if (score >= 70) return 'low';
    if (score >= 45) return 'medium';
    return 'high';
  }

  getScoreColor(score: number): string {
    if (score >= 70) return 'var(--green)';
    if (score >= 45) return 'var(--amber)';
    return 'var(--red)';
  }

  getBarColor(pct: number): string {
    if (pct >= 70) return 'var(--green)';
    if (pct >= 45) return 'var(--amber)';
    return 'var(--red)';
  }
}
