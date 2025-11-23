export interface User {
  id: number;
  username: string;
  email: string | null;
  isAdmin: boolean;
  isActive: boolean;
  createdAt: string;
}

export interface CreateUserInput {
  username: string;
  email: string | null;
  password: string;
  isAdmin: boolean;
}

export interface UpdateUserRoleInput {
  id: number;
  isAdmin: boolean;
}
