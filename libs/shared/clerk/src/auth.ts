import { createClerkClient, verifyToken } from '@clerk/backend';

export type ClerkEnv = {
  CLERK_SECRET_KEY: string;
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: string;
};

type ClerkUserType = {
  userId: string;
  userName: string | null;
  email: string | null;
};

export const createClerk = (env: ClerkEnv) => {
  return createClerkClient({
    secretKey: env.CLERK_SECRET_KEY,
    publishableKey: env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
  });
};

export const getClerkUser = async (
  env: ClerkEnv,
  userId: string,
): Promise<ClerkUserType> => {
  const clerk = createClerk(env);
  const user = await clerk.users.getUser(userId);

  return {
    userId,
    userName:
      user.username ??
      (`${user.firstName ?? ''} ${user.lastName ?? ''}`.trim() || null),
    email: user.emailAddresses[0]?.emailAddress ?? null,
  };
};

export const getAuthFromRequest = async (
  request: Request,
  env: ClerkEnv,
): Promise<{ userId: string } | null> => {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) return null;

  const token = authHeader.slice(7);
  try {
    const payload = await verifyToken(token, {
      secretKey: env.CLERK_SECRET_KEY,
    });

    return { userId: payload.sub };
  } catch {
    return null;
  }
};
