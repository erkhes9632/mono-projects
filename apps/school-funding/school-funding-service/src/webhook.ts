import { verifyWebhook } from '@clerk/backend/webhooks';
import { createDb, usersTable } from './db/index';

export const handleClerkWebhook = async (
  request: Request,
  env: Env,
): Promise<Response> => {
  let evt: any;

  try {
    evt = await verifyWebhook(request, {
      signingSecret: env.CLERK_WEBHOOK_SIGNING_SECRET,
    });
  } catch (err) {
    console.error('Clerk Webhook verification failed:', err);
    return new Response('Invalid signature', { status: 400 });
  }

  const {
    id,
    email_addresses,
    first_name,
    last_name,
    image_url,
    unsafe_metadata,
  } = evt.data;
  const eventType = evt.type;

  console.log(`[Clerk Webhook] Received event: ${eventType} for user: ${id}`);

  if (eventType === 'user.created' || eventType === 'user.updated') {
    const email = email_addresses?.[0]?.email_address || '';
    const userName =
      `${first_name || ''} ${last_name || ''}`.trim() || 'New User';

    const avatarUrl = image_url || null;

    const role = (unsafe_metadata?.role as 'STUDENT' | 'TEACHER') || 'STUDENT';

    const db = createDb(env);

    try {
      await db
        .insert(usersTable)
        .values({
          id: id,
          userName,
          email,
          avatarUrl,
          role,
          coinBalance: 100,
        })
        .onConflictDoUpdate({
          target: usersTable.id,
          set: {
            userName,
            email,
            avatarUrl,
            role,
          },
        });

      console.log(`[D1 Sync] Successfully synced user ${id} with role ${role}`);
    } catch (dbError) {
      console.error('[D1 Sync Error] Failed to write to database:', dbError);
      return new Response('Database operation failed', { status: 500 });
    }
  }

  return new Response('Webhook processed successfully', { status: 200 });
};
