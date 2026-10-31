import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../auth/auth.service';
import { DataService } from '../../data.service';
import { UserSettings } from '../../models';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="settings-page" style="max-width: 760px;">
      <div class="page-header">
        <h1 class="page-title">Settings &amp; Preferences</h1>
        <p class="page-subtitle">Manage your virtual trading profile, alert configurations, and system preferences</p>
      </div>

      @if (saveSuccess()) {
        <div class="alert alert-success">{{ saveSuccess() }}</div>
      }
      @if (saveError()) {
        <div class="alert alert-error">{{ saveError() }}</div>
      }

      <!-- Profile Overview Card -->
      <div class="card" style="margin-bottom: 20px;">
        <h3 style="font-size: 15px; font-weight: 700; color: var(--text); margin-bottom: 14px;">User Profile</h3>
        <div style="display: flex; align-items: center; gap: 16px;">
          <div class="avatar" style="width: 52px; height: 52px; font-size: 18px;">
            {{ initials() }}
          </div>
          <div>
            <h4 style="font-size: 16px; font-weight: 700; color: var(--text); margin: 0;">{{ auth.name() || 'Demo Investor' }}</h4>
            <p style="font-size: 13px; color: var(--muted); margin: 2px 0 0;">Virtual Trading Simulation Account</p>
            <span class="badge badge-blue" style="margin-top: 6px;">B.Tech CSE Project Edition</span>
          </div>
        </div>
      </div>

      <!-- Trading Preferences Form -->
      <div class="card" style="margin-bottom: 20px;">
        <h3 style="font-size: 15px; font-weight: 700; color: var(--text); margin-bottom: 14px;">Trading Preferences</h3>

        <form (ngSubmit)="saveSettings()">
          <div class="form-group">
            <label for="currencySelect">Display Currency</label>
            <select id="currencySelect" [(ngModel)]="settings.currency" name="currency">
              <option value="INR">INR (₹) — Indian Rupee</option>
              <option value="USD">USD ($) — US Dollar</option>
            </select>
            <div class="form-hint">Financial accounting is executed in Indian Rupees (INR).</div>
          </div>

          <div style="border-top: 1px solid var(--border); padding-top: 14px; margin-top: 14px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px;">
              <div>
                <strong style="font-size: 13.5px; color: var(--text);">Trade Order Confirmation</strong>
                <p style="font-size: 12px; color: var(--muted); margin: 2px 0 0;">
                  Require review before executing simulated market orders
                </p>
              </div>
              <input
                type="checkbox"
                [(ngModel)]="settings.tradeConfirmation"
                name="tradeConfirmation"
                style="width: 18px; height: 18px; cursor: pointer;"
              />
            </div>

            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px;">
              <div>
                <strong style="font-size: 13.5px; color: var(--text);">Portfolio Risk Warnings</strong>
                <p style="font-size: 12px; color: var(--muted); margin: 2px 0 0;">
                  Trigger telemetry alerts when single holding concentration exceeds 40%
                </p>
              </div>
              <input
                type="checkbox"
                [(ngModel)]="settings.riskAlerts"
                name="riskAlerts"
                style="width: 18px; height: 18px; cursor: pointer;"
              />
            </div>

            <div style="display: flex; justify-content: space-between; align-items: center;">
              <div>
                <strong style="font-size: 13.5px; color: var(--text);">Order Execution Notifications</strong>
                <p style="font-size: 12px; color: var(--muted); margin: 2px 0 0;">
                  Record in-app notifications whenever a buy or sell transaction fills
                </p>
              </div>
              <input
                type="checkbox"
                [(ngModel)]="settings.tradeAlerts"
                name="tradeAlerts"
                style="width: 18px; height: 18px; cursor: pointer;"
              />
            </div>
          </div>

          <button type="submit" class="btn btn-primary" style="margin-top: 20px;" [disabled]="saving()">
            @if (saving()) {
              <span class="spinner" style="width: 14px; height: 14px; border-width: 2px;"></span>
            }
            Save Preferences
          </button>
        </form>
      </div>

      <!-- Security & Session Card -->
      <div class="card">
        <h3 style="font-size: 15px; font-weight: 700; color: var(--text); margin-bottom: 12px;">Security &amp; Session</h3>
        <p style="font-size: 13px; color: var(--muted); margin-bottom: 16px;">
          Your session uses stateless JSON Web Tokens (JWT) with HMAC-SHA256 signature verification.
        </p>
        <button class="btn btn-danger btn-sm" (click)="auth.logout()">Sign Out of Account</button>
      </div>
    </div>
  `
})
export class SettingsComponent implements OnInit {
  auth = inject(AuthService);
  private dataService = inject(DataService);

  settings: UserSettings = {
    currency: 'INR',
    tradeConfirmation: true,
    riskAlerts: true,
    tradeAlerts: true
  };

  saving = signal(false);
  saveSuccess = signal('');
  saveError = signal('');

  ngOnInit() {
    this.dataService.getSettings().subscribe({
      next: s => {
        if (s) this.settings = s;
      }
    });
  }

  initials(): string {
    const name = this.auth.name() || 'Demo User';
    return name
      .split(' ')
      .filter(p => p.length > 0)
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }

  saveSettings() {
    this.saving.set(true);
    this.saveSuccess.set('');
    this.saveError.set('');

    this.dataService.updateSettings(this.settings).subscribe({
      next: updated => {
        this.settings = updated;
        this.saving.set(false);
        this.saveSuccess.set('Preferences saved successfully.');
      },
      error: err => {
        this.saving.set(false);
        this.saveError.set(err.error?.message || 'Failed to update settings.');
      }
    });
  }
}
