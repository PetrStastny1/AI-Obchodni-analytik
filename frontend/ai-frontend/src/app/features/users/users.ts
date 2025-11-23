/* eslint-disable @angular-eslint/component-class-no-template */
/* eslint-disable @angular-eslint/component-class-in-template-check */

import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Apollo, gql } from 'apollo-angular';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { UsersCreateDialogComponent } from './users-create-dialog';
import type { User, CreateUserInput } from './users.types';

@Component({
  standalone: true,
  selector: 'app-users',
  imports: [
    CommonModule,
    MatTableModule,
    MatIconModule,
    MatButtonModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './users.html',
  styleUrls: ['./users.scss'],
})
export class UsersComponent implements OnInit {
  private apollo = inject(Apollo);
  private dialog = inject(MatDialog);
  private snack = inject(MatSnackBar);

  users: User[] = [];
  loading = false;
  displayedColumns: string[] = ['avatar', 'username', 'role', 'status', 'createdAt', 'actions'];

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers() {
    const QUERY = gql`
      query Users {
        users {
          id
          username
          email
          isAdmin
          isActive
          createdAt
        }
      }
    `;

    this.loading = true;
    this.apollo
      .watchQuery({ query: QUERY, fetchPolicy: 'network-only' })
      .valueChanges.subscribe({
        next: (res) => {
          this.users = (res.data as any)?.users ?? [];
          this.loading = false;
        },
        error: () => {
          this.loading = false;
          this.snack.open('Nepodařilo se načíst uživatele', 'Zavřít', { duration: 4000 });
        },
      });
  }

  openCreateDialog() {
    const ref = this.dialog.open(UsersCreateDialogComponent, {
      panelClass: 'glass-dialog-panel',
    });

    ref.afterClosed().subscribe((result: CreateUserInput | null) => {
      if (!result) return;
      this.createUser(result);
    });
  }

  createUser(input: CreateUserInput) {
    const MUT = gql`
      mutation CreateUser($input: CreateUserInput!) {
        createUser(input: $input) {
          id
          username
          email
          isAdmin
          isActive
          createdAt
        }
      }
    `;

    this.apollo
      .mutate({
        mutation: MUT,
        variables: { input },
        refetchQueries: ['Users'],
      })
      .subscribe({
        next: () => this.snack.open('Uživatel vytvořen', 'OK', { duration: 3000 }),
        error: () => this.snack.open('Nepodařilo se vytvořit uživatele', 'Zavřít', { duration: 4000 }),
      });
  }

  toggleRole(user: User) {
    const MUT = gql`
      mutation UpdateUserRole($input: UpdateUserRoleInput!) {
        updateUserRole(input: $input) {
          id
          isAdmin
        }
      }
    `;

    this.apollo
      .mutate({
        mutation: MUT,
        variables: {
          input: {
            id: Number(user.id),
            isAdmin: !user.isAdmin,
          },
        },
        refetchQueries: ['Users'],
      })
      .subscribe({
        next: () => this.snack.open('Role upravena', 'OK', { duration: 2500 }),
        error: () => this.snack.open('Nepodařilo se upravit roli', 'Zavřít', { duration: 4000 }),
      });
  }

  toggleActive(user: User) {
    const MUT = user.isActive
      ? gql`
          mutation DeactivateUser($id: Int!) {
            deactivateUser(id: $id) {
              id
              isActive
            }
          }
        `
      : gql`
          mutation ActivateUser($id: Int!) {
            activateUser(id: $id) {
              id
              isActive
            }
          }
        `;

    this.apollo
      .mutate({
        mutation: MUT,
        variables: { id: Number(user.id) },
        refetchQueries: ['Users'],
      })
      .subscribe({
        next: () => this.snack.open('Stav účtu upraven', 'OK', { duration: 2500 }),
        error: () => this.snack.open('Nepodařilo se upravit stav účtu', 'Zavřít', { duration: 4000 }),
      });
  }

  resetPassword(user: User) {
    const MUT = gql`
      mutation ResetPassword($id: Int!) {
        resetPassword(id: $id)
      }
    `;

    this.apollo
      .mutate({
        mutation: MUT,
        variables: { id: Number(user.id) },
      })
      .subscribe({
        next: (res) => {
          const pwd = (res.data as any)?.resetPassword;
          if (pwd) {
            this.snack.open(`Nové heslo: ${pwd}`, 'OK', { duration: 7000 });
          } else {
            this.snack.open('Heslo bylo změněno, ale nepodařilo se ho zobrazit.', 'Zavřít', {
              duration: 4000,
            });
          }
        },
        error: () =>
          this.snack.open('Nepodařilo se resetovat heslo', 'Zavřít', { duration: 4000 }),
      });
  }
}
