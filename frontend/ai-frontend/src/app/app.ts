import { Component, signal } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';

import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';

import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
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
  isDark = signal(window.matchMedia('(prefers-color-scheme: dark)').matches);

  constructor(private router: Router) {
    const root = document.documentElement;
    if (this.isDark()) root.classList.add('dark-mode');

    this.router.events
      .pipe(filter(e => e instanceof NavigationEnd))
      .subscribe(() => {
        if (window.innerWidth < 960) {
          const sidenav = document.querySelector('mat-sidenav') as any;
          if (sidenav?.close) sidenav.close();
        }
      });
  }

  toggleDarkMode() {
    this.isDark.update(v => !v);

    const root = document.documentElement;
    if (this.isDark()) root.classList.add('dark-mode');
    else root.classList.remove('dark-mode');
  }
}