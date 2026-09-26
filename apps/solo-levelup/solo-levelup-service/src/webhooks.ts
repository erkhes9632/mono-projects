import { verifyWebhook } from '@clerk/backend/webhooks';
import { createDbProvider } from './drizzle-provider';
import { users } from './db';
import { Env } from './types';

interface WebhookUserPayload {
  id: string;
  email_addresses?: Array<{ email_address: string }>;
  first_name?: string | null;
  last_name?: string | null;
}

export const handleClerkWebhook = async (
  request: Request,
  env: Env,
): Promise<Response> => {
  if (!env.CLERK_WEBHOOK_SIGNING_SECRET) {
    console.error(
      '[Clerk Webhook] CLERK_WEBHOOK_SIGNING_SECRET is not configured.',
    );
    return new Response('Webhook signing secret not configured', {
      status: 500,
    });
  }

  let evt: { type: string; data: WebhookUserPayload };

  try {
    const body = await request.text();
    const headers = new Headers(request.headers);

    evt = (await verifyWebhook({ body, headers } as any, {
      signingSecret: env.CLERK_WEBHOOK_SIGNING_SECRET,
    })) as { type: string; data: WebhookUserPayload };
  } catch (err) {
    console.error('Clerk Webhook verification failed:', err);
    return new Response('Invalid signature', { status: 400 });
  }

  const { id, email_addresses, first_name, last_name } = evt.data;
  const eventType = evt.type;

  console.log(`[Clerk Webhook] Received event: ${eventType} for user: ${id}`);

  if (eventType === 'user.created' || eventType === 'user.updated') {
    const email = email_addresses?.[0]?.email_address || '';
    const userName =
      `${first_name || ''} ${last_name || ''}`.trim() ||
      email.split('@')[0] ||
      'User';

    const db = createDbProvider(env.DB);

    try {
      await db
        .insert(users)
        .values({
          id,
          userName,
          email,
        })
        .onConflictDoUpdate({
          target: users.id,
          set: {
            userName,
            email,
          },
        });

      console.log(`[D1 Sync] Successfully synced user ${id}`);
    } catch (dbError) {
      console.error('[D1 Sync Error] Failed to write to database:', dbError);
      return new Response('Database operation failed', { status: 500 });
    }
  }

  return new Response('Webhook processed successfully', { status: 200 });
};
