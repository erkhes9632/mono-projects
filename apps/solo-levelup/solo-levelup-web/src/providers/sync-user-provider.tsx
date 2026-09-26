'use client';

import { useEffect, useRef } from 'react';
import { useMutation } from '@apollo/client/react';
import { useUser } from '@clerk/nextjs';
import { SYNC_USER } from '../graphql/documents';

interface SyncUserData {
  syncUser: {
    id: string;
    userName: string | null;
    email: string | null;
  };
}

export function SyncUserProvider({ children }: { children: React.ReactNode }) {
  const { isSignedIn, user } = useUser();
  const [syncUserMutation] = useMutation<SyncUserData>(SYNC_USER);
  const hasSynced = useRef(false);

  useEffect(() => {
    if (isSignedIn && user && !hasSynced.current) {
      hasSynced.current = true;
      syncUserMutation()
        .then(({ data: syncData }) => {
          console.log('[SyncUser] User synced:', syncData?.syncUser?.id);
        })
        .catch((err) => {
          console.error('[SyncUser] Failed to sync user:', err);
          hasSynced.current = false;
        });
    }
  }, [isSignedIn, user, syncUserMutation]);

  return <>{children}</>;
}
