import { Injectable } from '@angular/core';
import { Apollo } from 'apollo-angular';
import {
  USERS_QUERY,
  CREATE_USER,
  UPDATE_ROLE,
  UPDATE_STATUS,
  RESET_PASSWORD,
} from './users.graphql';

@Injectable({ providedIn: 'root' })
export class UsersService {
  constructor(private apollo: Apollo) {}

  getAll() {
    return this.apollo.watchQuery({
      query: USERS_QUERY,
      fetchPolicy: 'network-only',
    }).valueChanges;
  }

  create(input: { username: string; password: string; isAdmin: boolean }) {
    return this.apollo.mutate({
      mutation: CREATE_USER,
      variables: { input },
      refetchQueries: [{ query: USERS_QUERY }],
    });
  }

  changeRole(id: number, isAdmin: boolean) {
    return this.apollo.mutate({
      mutation: UPDATE_ROLE,
      variables: { input: { id, isAdmin } },
      refetchQueries: [{ query: USERS_QUERY }],
    });
  }

  changeStatus(id: number, isActive: boolean) {
    return this.apollo.mutate({
      mutation: UPDATE_STATUS,
      variables: { input: { id, isActive } },
      refetchQueries: [{ query: USERS_QUERY }],
    });
  }

  resetPassword(id: number) {
    return this.apollo.mutate({
      mutation: RESET_PASSWORD,
      variables: { id },
    });
  }
}
