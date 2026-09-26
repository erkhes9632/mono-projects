import { GraphQLError } from 'graphql';
import { goals } from '../../../db';
import { GraphQLContext, GoalInput } from '../../../types';

/**
 * Create a new goal for the authenticated user.
 * After creation, fires a webhook to n8n to trigger goal decomposition.
 */
export async function createGoal(
  _: unknown,
  { input }: { input: GoalInput },
  ctx: GraphQLContext,
) {
  if (!ctx.userId) {
    throw new GraphQLError('Unauthorized');
  }

  const id = crypto.randomUUID();

  const [inserted] = await ctx.db
    .insert(goals)
    .values({
      id,
      userId: ctx.userId,
      title: input.title,
      description: input.description,
      status: 'ACTIVE',
      progressPercent: 0,
    })
    .returning();

  const n8nWebhookUrl = ctx.env.N8N_GOAL_DECOMPOSE_WEBHOOK_URL;
  if (n8nWebhookUrl) {
    try {
      await fetch(n8nWebhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          goalId: inserted.id,
          userId: inserted.userId,
          title: inserted.title,
          description: inserted.description,
        }),
      });
      console.log(`[createGoal] Triggered n8n decomposition for goal ${id}`);
    } catch (err) {
      console.error('[createGoal] Failed to notify n8n:', err);
    }
  }

  return inserted;
}
