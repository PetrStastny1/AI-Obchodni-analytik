import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  templateUrl: './login.html',
  styleUrls: ['./login.scss'],
  imports: [CommonModule, FormsModule],
})
export class LoginComponent {
  private http = inject(HttpClient);
  private router = inject(Router);
  private auth = inject(AuthService);

  username = '';
  password = '';
  loading = false;
  error = '';

  onSubmit() {
    this.error = '';
    this.loading = true;

    this.http
      .post<{ access_token: string }>('http://localhost:3000/auth/login', {
        username: this.username,
        password: this.password,
      })
      .subscribe({
        next: (res) => {
          localStorage.setItem('token', res.access_token);

          this.auth.setLoggedIn(true);

          this.router.navigate(['/dashboard']);
        },
        error: (err) => {
          this.error = err?.error?.message || 'Neplatné přihlašovací údaje.';
        },
      })
      .add(() => (this.loading = false));
  }
}
