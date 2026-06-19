'use client';

import { InMemoryCache, HttpLink, ApolloClient } from '@apollo/client';
import { ApolloProvider as Provider } from '@apollo/client/react';
import React from 'react';

const client = new ApolloClient({
  link: new HttpLink({
    uri: process.env.NEXT_PUBLIC_GRAPHQL_URL || 'http://localhost:4001',
  }),
  cache: new InMemoryCache(),
});

export const ApolloProvider = ({ children }: { children: React.ReactNode }) => {
  return <Provider client={client}>{children}</Provider>;
};
