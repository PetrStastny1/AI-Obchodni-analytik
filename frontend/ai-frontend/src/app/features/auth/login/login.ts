import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
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
  private auth = inject(AuthService);
  private router = inject(Router);

  username = '';
  password = '';
  loading = false;
  error = '';

  onSubmit() {
    this.error = '';
    this.loading = true;

    this.auth.login(this.username, this.password)
      .subscribe({
        next: (res) => {
          this.auth.saveSession(res.token, res.user);
          this.router.navigate(['/dashboard']);
        },
        error: (err) => {
          this.error = err?.error?.message || 'Neplatné přihlašovací údaje.';
        }
      })
      .add(() => {
        this.loading = false;
      });
  }
}
