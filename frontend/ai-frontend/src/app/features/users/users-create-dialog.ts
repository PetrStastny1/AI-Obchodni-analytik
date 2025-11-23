import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import type { CreateUserInput } from './users.types';

@Component({
  standalone: true,
  selector: 'app-users-create-dialog',
  imports: [
    CommonModule,
    FormsModule,
    MatCheckboxModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule
  ],
  templateUrl: './users-create-dialog.html',
  styleUrls: ['./users-create-dialog.scss']
})
export class UsersCreateDialogComponent {
  private dialogRef = inject(MatDialogRef<UsersCreateDialogComponent>);

  form: CreateUserInput = {
    username: '',
    email: null,
    password: '',
    isAdmin: false
  };

  save() {
    if (!this.form.username || !this.form.password) return;
    if (this.form.email === '') this.form.email = null;
    this.dialogRef.close(this.form);
  }

  cancel() {
    this.dialogRef.close(null);
  }
}
