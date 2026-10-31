import { Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from './auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="auth-page">
      <div class="auth-container">
        <!-- Left Branding & Feature Hero -->
        <div class="auth-hero">
          <div>
            <div class="auth-hero-logo">
              <div class="auth-hero-logo-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/>
                  <polyline points="16 7 22 7 22 13"/>
                </svg>
              </div>
              <div>
                <h1 style="font-size: 20px; font-weight: 700; line-height: 1.2; margin: 0; color: #fff;">PortfolioPro</h1>
                <span style="font-size: 11px; color: #8CA8C5; letter-spacing: 0.5px;">SMART TRADING &amp; RISK INTELLIGENCE</span>
              </div>
            </div>

            <div class="auth-feature-list">
              <div class="auth-feature-item">
                <div class="auth-feature-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="12" y1="1" x2="12" y2="23"/>
                    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                  </svg>
                </div>
                <div>
                  <strong style="font-size: 13.5px; color: #FFFFFF;">TradeLab Paper Trading</strong>
                  <p style="font-size: 12px; color: #8CA8C5; margin: 2px 0 0; line-height: 1.4;">
                    Execute simulated market orders with ₹10,00,000 in virtual capital.
                  </p>
                </div>
              </div>

              <div class="auth-feature-item">
                <div class="auth-feature-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
                  </svg>
                </div>
                <div>
                  <strong style="font-size: 13.5px; color: #FFFFFF;">Portfolio Health Doctor</strong>
                  <p style="font-size: 12px; color: #8CA8C5; margin: 2px 0 0; line-height: 1.4;">
                    Transparent 0–100 health telemetry with explainable concentration alerts.
                  </p>
                </div>
              </div>

              <div class="auth-feature-item">
                <div class="auth-feature-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
                  </svg>
                </div>
                <div>
                  <strong style="font-size: 13.5px; color: #FFFFFF;">Market Shock Lab</strong>
                  <p style="font-size: 12px; color: #8CA8C5; margin: 2px 0 0; line-height: 1.4;">
                    Stress-test your portfolio against black swan crashes and sector shocks.
                  </p>
                </div>
              </div>

              <div class="auth-feature-item">
                <div class="auth-feature-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="18" y1="20" x2="18" y2="10"/>
                    <line x1="12" y1="20" x2="12" y2="4"/>
                    <line x1="6" y1="20" x2="6" y2="14"/>
                  </svg>
                </div>
                <div>
                  <strong style="font-size: 13.5px; color: #FFFFFF;">TradeLens Reflection</strong>
                  <p style="font-size: 12px; color: #8CA8C5; margin: 2px 0 0; line-height: 1.4;">
                    Document trading theses in a journal and uncover behavioral patterns.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div style="font-size: 11px; color: #71839C; border-top: 1px solid rgba(255,255,255,0.08); padding-top: 14px;">
            B.Tech CSE Major Project • Demo Ready Application
          </div>
        </div>

        <!-- Right Form Panel -->
        <div class="auth-form-wrap">
          <!-- Auth Navigation Tabs -->
          <div class="auth-tabs">
            <a routerLink="/login" class="auth-tab active">Sign In</a>
            <a routerLink="/signup" class="auth-tab">Create Account</a>
          </div>

          <h2 style="font-size: 22px; font-weight: 700; color: var(--text); margin-bottom: 4px;">Sign In</h2>
          <p style="font-size: 13px; color: var(--muted); margin-bottom: 20px;">
            Access your simulated trading portfolio and analytics
          </p>

          <!-- Continue with Google Button -->
          <button
            type="button"
            class="btn-google"
            (click)="continueWithGoogle()"
            [disabled]="googleLoading() || loading()"
          >
            @if (googleLoading()) {
              <span class="spinner" style="width: 16px; height: 16px; border-width: 2px;"></span>
            } @else {
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
              </svg>
            }
            <span>Continue with Google</span>
          </button>

          <div class="auth-divider">
            <span>OR CONTINUE WITH EMAIL</span>
          </div>

          @if (error()) {
            <div class="alert alert-error">{{ error() }}</div>
          }

          <form [formGroup]="form" (ngSubmit)="submit()">
            <div class="form-group">
              <label for="email">Email Address</label>
              <input
                id="email"
                type="email"
                formControlName="email"
                placeholder="e.g. demo@portfoliopro.local"
                autocomplete="email"
              />
              @if (form.get('email')?.touched && form.get('email')?.invalid) {
                <div class="form-error">Please enter a valid email address.</div>
              }
            </div>

            <div class="form-group">
              <label for="password">Password</label>
              <div class="password-wrap">
                <input
                  id="password"
                  [type]="showPassword() ? 'text' : 'password'"
                  formControlName="password"
                  placeholder="Enter your password"
                  autocomplete="current-password"
                />
                <button
                  type="button"
                  class="password-toggle"
                  (click)="showPassword.set(!showPassword())"
                  [attr.aria-label]="showPassword() ? 'Hide password' : 'Show password'"
                >
                  @if (showPassword()) {
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                      <line x1="1" y1="1" x2="23" y2="23"/>
                    </svg>
                  } @else {
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                  }
                </button>
              </div>
              @if (form.get('password')?.touched && form.get('password')?.invalid) {
                <div class="form-error">Password is required.</div>
              }
            </div>

            <button
              type="submit"
              class="btn btn-primary"
              style="width: 100%; padding: 11px; margin-top: 4px; font-size: 14px;"
              [disabled]="loading()"
            >
              @if (loading()) {
                <span class="spinner" style="width: 16px; height: 16px; border-width: 2px;"></span>
              }
              Sign In to PortfolioPro
            </button>
          </form>

          <!-- Evaluator Quick Login Helper -->
          <div style="margin-top: 20px; padding: 12px 14px; background: #F4F8FD; border: 1.5px dashed var(--border); border-radius: 10px;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <div>
                <strong style="font-size: 12px; color: var(--text); display: block;">Project Evaluator Demo Credentials</strong>
                <span style="font-size: 11px; color: var(--muted); font-family: monospace;">demo&#64;portfoliopro.local / Demo&#64;12345</span>
              </div>
              <button
                type="button"
                class="btn btn-outline btn-sm"
                style="padding: 4px 10px; font-size: 11px;"
                (click)="fillDemoCredentials()"
              >
                Auto-Fill
              </button>
            </div>
          </div>

          <div style="text-align: center; margin-top: 16px; font-size: 13px; color: var(--muted);">
            New to PortfolioPro?
            <a routerLink="/signup" style="font-weight: 600;">Create Account</a>
          </div>
        </div>
      </div>
    </div>
  `
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);

  form = this.fb.group({
    email: ['demo@portfoliopro.local', [Validators.required, Validators.email]],
    password: ['Demo@12345', Validators.required]
  });

  showPassword = signal(false);
  error = signal('');
  loading = signal(false);
  googleLoading = signal(false);

  continueWithGoogle() {
    this.googleLoading.set(true);
    this.error.set('');

    this.auth.loginWithGoogle().subscribe({
      next: () => {
        this.googleLoading.set(false);
        this.router.navigate(['/dashboard']);
      },
      error: err => {
        this.googleLoading.set(false);
        this.error.set(err.error?.message || 'Google sign in failed. Please try again.');
      }
    });
  }

  fillDemoCredentials() {
    this.form.patchValue({
      email: 'demo@portfoliopro.local',
      password: 'Demo@12345'
    });
  }

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.error.set('');

    this.auth.login(this.form.value as any).subscribe({
      next: () => {
        this.loading.set(false);
        this.router.navigate(['/dashboard']);
      },
      error: err => {
        this.loading.set(false);
        this.error.set(err.error?.message || 'Login failed. Invalid email or password.');
      }
    });
  }
}
