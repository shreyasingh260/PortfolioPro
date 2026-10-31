import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../auth/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  template: `
    <nav class="nav">
      <a class="brand" routerLink="/overview">PortfolioPro</a>
      <div class="links">
        <a routerLink="/overview" routerLinkActive="active">Overview</a>
        <a routerLink="/market" routerLinkActive="active">Market</a>
        <a routerLink="/trade" routerLinkActive="active">Trade</a>
        <a routerLink="/portfolio" routerLinkActive="active">Portfolio</a>
      </div>
      <div class="user">
        <span>{{ auth.name() }}</span>
        <button class="btn ghost" (click)="auth.logout()">Sign out</button>
      </div>
    </nav>
  `
})
export class NavbarComponent {
  auth = inject(AuthService);
}
