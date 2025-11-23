import { gql } from 'apollo-angular';

export const USERS_QUERY = gql`
  query {
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

export const CREATE_USER = gql`
  mutation ($input: CreateUserInput!) {
    createUser(input: $input) {
      id
      username
      isAdmin
      isActive
    }
  }
`;

export const UPDATE_ROLE = gql`
  mutation ($input: UpdateUserRoleInput!) {
    updateUserRole(input: $input) {
      id
      username
      isAdmin
    }
  }
`;

export const UPDATE_STATUS = gql`
  mutation ($input: UpdateUserInput!) {
    updateUser(input: $input) {
      id
      username
      isActive
    }
  }
`;

export const RESET_PASSWORD = gql`
  mutation ($id: Int!) {
    resetPassword(id: $id)
  }
`;
