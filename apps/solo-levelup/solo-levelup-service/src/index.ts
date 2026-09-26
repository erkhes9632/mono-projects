import { ApolloServer, GraphQLRequestContext } from '@apollo/server';
import { startServerAndCreateCloudflareWorkersHandler } from '@as-integrations/cloudflare-workers';
import { typeDefs, resolvers } from './graphql';
import { createDbProvider } from './drizzle-provider';
import { verifyToken } from '@clerk/backend';
import { Env, GraphQLContext } from './types';
import { handleClerkWebhook } from './webhooks';

const getCorsHeaders = (request: Request) => {
  const origin = request.headers.get('Origin') || '*';
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'GET,HEAD,POST,OPTIONS',
    'Access-Control-Allow-Headers':
      'Content-Type, Authorization, X-Requested-With, X-Service-Key',
    'Access-Control-Allow-Credentials': 'true',
  };
};

const corsPlugin = {
  async requestDidStart() {
    return {
      async willSendResponse(ctx: GraphQLRequestContext<GraphQLContext>) {
        if (!ctx.response.http) return;

        const req = ctx.request.http;
        const origin = req?.headers.get('origin') || '*';

        ctx.response.http.headers.set('Access-Control-Allow-Origin', origin);
        ctx.response.http.headers.set(
          'Access-Control-Allow-Methods',
          'GET,HEAD,POST,OPTIONS',
        );
        ctx.response.http.headers.set(
          'Access-Control-Allow-Headers',
          'Content-Type, Authorization, X-Requested-With, X-Service-Key',
        );
        ctx.response.http.headers.set(
          'Access-Control-Allow-Credentials',
          'true',
        );
      },
    };
  },
};

const server = new ApolloServer<GraphQLContext>({
  typeDefs,
  resolvers,
  introspection: true,
  csrfPrevention: false,
  plugins: [corsPlugin],
});

const handler = startServerAndCreateCloudflareWorkersHandler<
  Env,
  GraphQLContext
>(server, {
  context: async ({ request, env }) => {
    const db = createDbProvider(env.DB);

    const serviceKey = request.headers.get('x-service-key');
    if (serviceKey && serviceKey === env.N8N_SERVICE_KEY) {
      return {
        db,
        env,
        userId: undefined,
        isService: true,
      };
    }

    const jwt = await extractJwt(request, env);
    console.log('[Clerk] user:', jwt.userId ? jwt.userId : 'not authenticated');

    return {
      db,
      env,
      userId: jwt.userId,
      userEmail: jwt.email,
      isService: false,
    };
  },
});

async function extractJwt(
  request: Request,
  env: Env,
): Promise<{ userId?: string; email?: string }> {
  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) return {};
  const token = authHeader.slice(7);

  if (!env.CLERK_SECRET_KEY) {
    console.error(
      '[Clerk] CLERK_SECRET_KEY is not configured. JWT verification will fail.',
    );
    return {};
  }

  try {
    const verified = await verifyToken(token, {
      secretKey: env.CLERK_SECRET_KEY,
    });
    return {
      userId: verified.sub,
      email: (verified as any).email as string | undefined,
    };
  } catch (err) {
    console.warn('[Clerk] JWT verification failed:', err);
    return {};
  }
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext) {
    const corsHeaders = getCorsHeaders(request);
    const url = new URL(request.url);

    if (url.pathname === '/webhooks/clerk') {
      if (request.method !== 'POST') {
        return new Response('Method Not Allowed', { status: 405 });
      }
      return handleClerkWebhook(request, env);
    }

    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: corsHeaders,
      });
    }

    const response = await handler(request, env, ctx);
    const newResponse = new Response(response.body, response);

    Object.entries(corsHeaders).forEach(([key, value]) => {
      newResponse.headers.set(key, value);
    });

    return newResponse;
  },
};
