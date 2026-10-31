import { Component, inject, signal, HostListener, OnInit } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../auth/auth.service';
import { DataService } from '../data.service';
import { NotificationItem } from '../models';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule, FormsModule, DatePipe],
  template: `
    <div class="app-shell">
      <!-- Mobile Overlay -->
      @if (sidebarOpen()) {
        <div class="sidebar-overlay" (click)="sidebarOpen.set(false)"></div>
      }

      <!-- Fixed Left Sidebar -->
      <aside class="sidebar" [class.open]="sidebarOpen()">
        <div class="sidebar-logo">
          <div class="logo-mark">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/>
              <polyline points="16 7 22 7 22 13"/>
            </svg>
          </div>
          <div class="logo-text">
            PortfolioPro
            <span>Smart Trading Platform</span>
          </div>
        </div>

        <nav class="sidebar-nav">
          <a class="nav-item" routerLink="/dashboard" routerLinkActive="active" (click)="closeSidebar()">
            <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
            </svg>
            Dashboard
          </a>

          <a class="nav-item" routerLink="/tradelab" routerLinkActive="active" (click)="closeSidebar()">
            <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="12" y1="1" x2="12" y2="23"/>
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
            </svg>
            TradeLab
          </a>

          <a class="nav-item" routerLink="/portfolio-health" routerLinkActive="active" (click)="closeSidebar()">
            <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
            </svg>
            Portfolio Health
          </a>

          <a class="nav-item" routerLink="/market-shock-lab" routerLinkActive="active" (click)="closeSidebar()">
            <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
            </svg>
            Market Shock Lab
          </a>

          <a class="nav-item" routerLink="/tradelens" routerLinkActive="active" (click)="closeSidebar()">
            <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="20" x2="18" y2="10"/>
              <line x1="12" y1="20" x2="12" y2="4"/>
              <line x1="6" y1="20" x2="6" y2="14"/>
            </svg>
            TradeLens
          </a>

          <div class="nav-divider"></div>

          <a class="nav-item" routerLink="/settings" routerLinkActive="active" (click)="closeSidebar()">
            <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="3"/>
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
            </svg>
            Settings
          </a>

          <a class="nav-item" (click)="logout()" style="color: #FF8B8D; cursor: pointer;">
            <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            Sign Out
          </a>
        </nav>

        <div class="sidebar-footer">
          <div style="font-weight: 600; color: #E0E8F4;">PortfolioPro v1.0.0</div>
          <div>B.Tech CSE Major Project</div>
          <div style="opacity: 0.6; margin-top: 2px;">Virtual Trading Simulator</div>
        </div>
      </aside>

      <!-- Main Workspace -->
      <div class="main-area">
        <!-- Top Navigation Bar -->
        <header class="topnav">
          <button class="hamburger" (click)="sidebarOpen.set(!sidebarOpen())" aria-label="Toggle menu">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/>
            </svg>
          </button>

          <div class="search-wrap">
            <svg class="search-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input
              class="search-input"
              type="text"
              placeholder="Search stocks (e.g. TCS, INFY, HDFC)..."
              [(ngModel)]="searchQuery"
              (keyup.enter)="onSearch()"
            />
          </div>

          <div class="topnav-spacer"></div>

          <span class="demo-badge">Demo Market Data — Not Live Quotes</span>

          <!-- Notifications Bell -->
          <div class="notif-wrap">
            <button class="notif-btn" (click)="toggleNotifPanel($event)" aria-label="Notifications">
              <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
              </svg>
              @if (unreadCount() > 0) {
                <span class="notif-badge">{{ unreadCount() > 9 ? '9+' : unreadCount() }}</span>
              }
            </button>

            @if (showNotifPanel()) {
              <div class="notif-panel" (click)="$event.stopPropagation()">
                <div class="notif-panel-header">
                  <span>Notifications</span>
                  @if (unreadCount() > 0) {
                    <span class="badge badge-blue">{{ unreadCount() }} new</span>
                  }
                </div>
                @if (notifications().length === 0) {
                  <div class="empty-state" style="padding: 24px;">
                    <p>No notifications yet</p>
                  </div>
                }
                @for (n of notifications(); track n.id) {
                  <div class="notif-item" [class.unread]="!n.isRead" (click)="markRead(n)">
                    <div class="notif-title">{{ n.title }}</div>
                    <div class="notif-msg">{{ n.message }}</div>
                    <div class="notif-time">{{ n.createdAt | date:'short' }}</div>
                  </div>
                }
              </div>
            }
          </div>

          <!-- User Profile Dropdown -->
          <div class="user-menu">
            <button class="user-btn" (click)="toggleUserMenu($event)">
              <div class="avatar">{{ initials() }}</div>
              <span style="max-width: 120px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                {{ auth.name() || 'Investor' }}
              </span>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="6 9 12 15 18 9"/>
              </svg>
            </button>

            @if (showUserMenu()) {
              <div class="dropdown" (click)="$event.stopPropagation()">
                <div class="dropdown-header">
                  <div class="dropdown-name">{{ auth.name() || 'Demo User' }}</div>
                  <div class="dropdown-email">Virtual Trading Account</div>
                </div>
                <button class="dropdown-item" routerLink="/settings" (click)="showUserMenu.set(false)">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="8" r="4"/><path d="M6 20v-2a6 6 0 0 1 12 0v2"/>
                  </svg>
                  Profile & Settings
                </button>
                <button class="dropdown-item danger" (click)="logout()">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                    <polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
                  </svg>
                  Sign Out
                </button>
              </div>
            }
          </div>
        </header>

        <!-- Route Container -->
        <main class="page-content">
          <router-outlet />
        </main>
      </div>
    </div>
  `
})
export class ShellComponent implements OnInit {
  auth = inject(AuthService);
  data = inject(DataService);
  router = inject(Router);

  sidebarOpen = signal(false);
  showUserMenu = signal(false);
  showNotifPanel = signal(false);
  searchQuery = '';
  notifications = signal<NotificationItem[]>([]);
  unreadCount = signal(0);

  ngOnInit() {
    this.loadNotifications();
  }

  initials(): string {
    const name = this.auth.name() || 'Demo Investor';
    return name
      .split(' ')
      .filter(p => p.length > 0)
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }

  loadNotifications() {
    this.data.notifications().subscribe({
      next: notifs => this.notifications.set(notifs),
      error: () => {}
    });
    this.data.unreadCount().subscribe({
      next: res => this.unreadCount.set(res.count),
      error: () => {}
    });
  }

  toggleUserMenu(e: Event) {
    e.stopPropagation();
    this.showUserMenu.update(v => !v);
    this.showNotifPanel.set(false);
  }

  toggleNotifPanel(e: Event) {
    e.stopPropagation();
    this.showNotifPanel.update(v => !v);
    this.showUserMenu.set(false);
  }

  closeSidebar() {
    this.sidebarOpen.set(false);
  }

  markRead(n: NotificationItem) {
    if (!n.isRead) {
      this.data.markNotifRead(n.id).subscribe({
        next: () => {
          n.isRead = true;
          this.unreadCount.update(c => Math.max(0, c - 1));
        }
      });
    }
    if (n.relatedRoute) {
      this.router.navigate([n.relatedRoute]);
    }
    this.showNotifPanel.set(false);
  }

  onSearch() {
    if (this.searchQuery.trim()) {
      this.router.navigate(['/tradelab'], { queryParams: { q: this.searchQuery.trim() } });
      this.searchQuery = '';
    }
  }

  logout() {
    this.showUserMenu.set(false);
    this.auth.logout();
  }

  @HostListener('document:click')
  onDocClick() {
    this.showUserMenu.set(false);
    this.showNotifPanel.set(false);
  }
}
