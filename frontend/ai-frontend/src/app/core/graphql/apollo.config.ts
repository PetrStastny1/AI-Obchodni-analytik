import { inject, Provider } from '@angular/core';
import { APOLLO_OPTIONS } from 'apollo-angular';
import { ApolloClientOptions, InMemoryCache } from '@apollo/client/core';
import { HttpLink } from 'apollo-angular/http';
import { setContext } from '@apollo/client/link/context';
import { AuthService } from '../auth/auth.service';

export const APOLLO_PROVIDER: Provider = {
  provide: APOLLO_OPTIONS,
  useFactory: (): ApolloClientOptions => {
    const httpLink = inject(HttpLink);
    const auth = inject(AuthService);

    const authLink = setContext((_operation, prevContext) => {
      const token = auth.getToken();

      return {
        ...prevContext,
        ['fetchOptions']: {
          ...(prevContext?.['fetchOptions'] ?? {}),
          headers: {
            ...(prevContext?.['fetchOptions']?.headers ?? {}),
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        },
      };
    });

    return {
      cache: new InMemoryCache(),
      link: authLink.concat(
        httpLink.create({ uri: 'http://localhost:3000/graphql' })
      ),
    };
  },
};
