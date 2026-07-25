import { getAuthFromRequest, getClerkUser } from '@erkhes-monorepo/clerk';
import { ApolloServer, GraphQLRequestContext } from '@apollo/server';
import { startServerAndCreateCloudflareWorkersHandler } from '@as-integrations/cloudflare-workers';
import { GraphQLContext } from './types/index';
import { ExecutionContext } from '@cloudflare/workers-types';
import { resolvers } from './graphql/resolvers/index';
import { typeDefs } from './graphql/schema';
import { drizzleProvider } from './drizzle.provider';
import { handleClerkWebhook } from './webhook';

const getCorsHeaders = (request: Request) => {
  const origin = request.headers.get('Origin') || '*';
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'GET,HEAD,POST,OPTIONS',
    'Access-Control-Allow-Headers':
      'Content-Type, Authorization, X-Requested-With',
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
          'Content-Type, Authorization, X-Requested-With',
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
    const db = drizzleProvider(env.DB);
    const auth = await getAuthFromRequest(request, env);
    const user = auth ? await getClerkUser(env, auth.userId) : null;
    console.log(
      '[Clerk] user:',
      user ? `${user.userName}, ${user.email}` : 'not authenticated',
    );
    return {
      db,
      env,
      userId: user?.userId,
      userName: user?.userName,
      email: user?.email,
    };
  },
});

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext) {
    const corsHeaders = getCorsHeaders(request);
    const url = new URL(request.url);

    if (url.pathname === '/api/webhook') {
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
