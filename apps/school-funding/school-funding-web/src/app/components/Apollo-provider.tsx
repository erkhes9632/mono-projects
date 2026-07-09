'use client';

import { ApolloProvider } from '@apollo/client/react';
import { useAuth } from '@clerk/nextjs';
import { useMemo } from 'react';
import { createApolloClient } from '../lib/apollo-client';

export function ClerkApolloProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { getToken } = useAuth();

  const client = useMemo(() => createApolloClient(getToken), []);

  return <ApolloProvider client={client}>{children}</ApolloProvider>;
}
