import {
  ApolloClient,
  InMemoryCache,
  ApolloLink,
  HttpLink,
} from '@apollo/client';
import { SetContextLink } from '@apollo/client/link/context';

type GetTokenType = () => Promise<string | null>;

const httpLink = new HttpLink({
  uri: process.env.NEXT_PUBLIC_GRAPHQL_URL ?? 'http://localhost:4001',
});

export const createApolloClient = (getToken: GetTokenType) => {
  const authLink = new SetContextLink(async (prevContext) => {
    try {
      const token = await getToken();

      const existingHeaders =
        (prevContext as Record<string, any>)?.headers ?? {};

      return {
        headers: {
          ...existingHeaders,
          Authorization: token ? `Bearer ${token}` : '',
        },
      };
    } catch (error) {
      console.error('Error fetching token in SetContextLink:', error);
      return prevContext;
    }
  });

  return new ApolloClient({
    link: ApolloLink.from([authLink, httpLink]),
    cache: new InMemoryCache(),
  });
};
