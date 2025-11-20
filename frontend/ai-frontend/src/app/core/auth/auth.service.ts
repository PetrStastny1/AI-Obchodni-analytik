import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private tokenKey = 'access_token';
  private loggedIn = signal<boolean>(this.hasToken());

  constructor(private http: HttpClient, private router: Router) {}

  login(username: string, password: string) {
    return this.http.post<{ access_token: string; user?: any }>(
      'http://localhost:3000/auth/login',
      { username, password }
    );
  }

  saveToken(token: string) {
    localStorage.setItem(this.tokenKey, token);
    this.loggedIn.set(true);
  }

  setLoggedIn(value: boolean) {
    this.loggedIn.set(value);
  }

  logout() {
    localStorage.removeItem(this.tokenKey);
    this.loggedIn.set(false);
    this.router.navigate(['/login']);
  }

  private hasToken(): boolean {
    return !!localStorage.getItem(this.tokenKey);
  }

  isLoggedIn(): boolean {
    return this.loggedIn();
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }
}
