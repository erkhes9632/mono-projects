'use client';

import { ApolloClient, InMemoryCache, HttpLink } from '@apollo/client';
import { ApolloProvider } from '@apollo/client/react';
import { useAuth } from '@clerk/nextjs';
import { useRef } from 'react';

export function ApolloWrapper({ children }: { children: React.ReactNode }) {
  const { getToken } = useAuth();

  const getTokenRef = useRef(getToken);
  getTokenRef.current = getToken;

  const clientRef = useRef<ApolloClient | null>(null);

  if (!clientRef.current) {
    const httpLink = new HttpLink({
      uri:
        process.env.NEXT_PUBLIC_GRAPHQL_URL || 'http://localhost:4002/graphql',
      fetch: async (uri: RequestInfo | URL, options?: RequestInit) => {
        const token = await getTokenRef.current();
        const headers: Record<string, string> = {};

        if (options?.headers) {
          if (options.headers instanceof Headers) {
            options.headers.forEach((value, key) => {
              headers[key] = value;
            });
          } else if (Array.isArray(options.headers)) {
            options.headers.forEach(([key, value]) => {
              headers[key] = value;
            });
          } else {
            Object.assign(headers, options.headers);
          }
        }

        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }

        return fetch(uri, {
          ...options,
          headers,
        });
      },
    });

    clientRef.current = new ApolloClient({
      link: httpLink,
      cache: new InMemoryCache(),
    });
  }

  return <ApolloProvider client={clientRef.current}>{children}</ApolloProvider>;
}
