import { Component, signal, computed, inject, ViewChild } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';

import { MatSidenavModule, MatSidenav } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';

import { filter } from 'rxjs/operators';
import { AuthService } from './core/auth/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MatSidenavModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatListModule
  ],
  templateUrl: './app.html',
  styleUrls: ['./app.scss']
})
export class App {
  @ViewChild(MatSidenav) sidenav!: MatSidenav;

  private auth = inject(AuthService);

  isDark = signal(window.matchMedia('(prefers-color-scheme: dark)').matches);
  isAuthenticated$ = computed(() => this.auth.isLoggedIn());


  constructor(private router: Router) {
    this.applyInitialTheme();

    this.router.events
      .pipe(filter(e => e instanceof NavigationEnd))
      .subscribe(() => {
        if (window.innerWidth < 960 && this.sidenav) {
          this.sidenav.close();
        }
      });
  }

  private applyInitialTheme() {
    const root = document.documentElement;
    if (this.isDark()) root.classList.add('dark-mode');
  }

  toggleDarkMode() {
    this.isDark.update(v => !v);
    document.documentElement.classList.toggle('dark-mode', this.isDark());
  }

  logout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
