import {
  Component,
  signal,
  computed,
  inject,
  ViewChild,
} from '@angular/core';
import {
  RouterOutlet,
  Router,
  NavigationEnd,
  RouterLink,
  RouterLinkActive,
} from '@angular/router';
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
    MatListModule,
  ],
  templateUrl: './app.html',
  styleUrls: ['./app.scss'],
})
export class App {
  @ViewChild(MatSidenav) sidenav!: MatSidenav;

  private auth = inject(AuthService);

  /** === Signals === */
  isAuthenticated$ = computed(() => this.auth.isLoggedIn());
  currentUser = computed(() => this.auth.getUser());

  /** Admin check */
  isAdmin = computed(() => {
    const user = this.currentUser();
    return !!user?.isAdmin; // ✔️ správně
  });

  constructor(private router: Router) {
    /** Zavře menu na mobilu po navigaci */
    this.router.events
      .pipe(filter((e) => e instanceof NavigationEnd))
      .subscribe(() => {
        if (window.innerWidth < 960 && this.sidenav) {
          this.sidenav.close();
        }
      });
  }

  /** === Toolbar actions === */
  goUsers() {
    this.router.navigate(['/users']);
  }

  logout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
