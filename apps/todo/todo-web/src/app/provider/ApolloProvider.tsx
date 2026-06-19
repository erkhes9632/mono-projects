'use client';

import { InMemoryCache, HttpLink, ApolloClient } from '@apollo/client';
import { ApolloProvider as Provider } from '@apollo/client/react';
import React from 'react';

const client = new ApolloClient({
  link: new HttpLink({ uri: 'http://localhost:4001' }),
  cache: new InMemoryCache(),
});

export const ApolloProvider = ({ children }: { children: React.ReactNode }) => {
  return <Provider client={client}>{children}</Provider>;
};
