import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

interface AuthUser {
  id: number;
  username: string;
  isAdmin: boolean;
  isActive: boolean;
  email?: string | null;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private api = 'http://localhost:3000/auth';

  private tokenKey = 'access_token';
  private userKey = 'auth_user';

  private currentUser = signal<AuthUser | null>(this.loadUser());
  private loggedIn = signal<boolean>(this.hasToken() && !!this.currentUser());

  constructor(private http: HttpClient, private router: Router) {}

  login(username: string, password: string) {
    return this.http.post<{ token: string; user: AuthUser }>(
      `${this.api}/login`,
      { username, password }
    );
  }

  saveSession(token: string, user: AuthUser) {
    localStorage.setItem(this.tokenKey, token);
    localStorage.setItem(this.userKey, JSON.stringify(user));
    this.currentUser.set(user);
    this.loggedIn.set(true);
  }

  refreshToken() {
    return this.http.get<{ token: string }>(`${this.api}/refresh`);
  }

  logout() {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
    this.currentUser.set(null);
    this.loggedIn.set(false);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  getUser(): AuthUser | null {
    return this.currentUser();
  }

  isAdmin(): boolean {
    return !!this.currentUser()?.isAdmin;
  }

  isLoggedIn(): boolean {
    return this.loggedIn();
  }

  private hasToken(): boolean {
    return !!localStorage.getItem(this.tokenKey);
  }

  private loadUser(): AuthUser | null {
    const raw = localStorage.getItem(this.userKey);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as AuthUser;
    } catch {
      return null;
    }
  }
}
