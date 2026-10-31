import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs';
import { API } from '../api';

export interface AuthResponse { token: string; name: string; email: string; }

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);

  login(data: { email: string; password: string }) {
    return this.http.post<AuthResponse>(`${API}/auth/login`, data).pipe(tap(r => this.store(r)));
  }

  signup(data: { name: string; email: string; password: string }) {
    return this.http.post<AuthResponse>(`${API}/auth/signup`, data).pipe(tap(r => this.store(r)));
  }

  loginWithGoogle() {
    return this.http.post<AuthResponse>(`${API}/auth/google`, {}).pipe(tap(r => this.store(r)));
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('name');
    this.router.navigate(['/login']);
  }

  isLoggedIn(): boolean { return !!localStorage.getItem('token'); }
  token(): string | null { return localStorage.getItem('token'); }
  name(): string { return localStorage.getItem('name') ?? ''; }

  private store(r: AuthResponse) {
    localStorage.setItem('token', r.token);
    localStorage.setItem('name', r.name);
  }
}
