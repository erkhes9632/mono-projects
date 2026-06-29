import { ApolloServer } from '@apollo/server';
import { startServerAndCreateCloudflareWorkersHandler } from '@as-integrations/cloudflare-workers';
import { GraphQLContext } from './types';
import { drizzleProvider } from './drizzle.provider';
import { TypeDefs } from './graphql/schema';
import { ExecutionContext } from '@cloudflare/workers-types';
import { resolvers } from './graphql/resolvers';

const server = new ApolloServer<GraphQLContext>({
  typeDefs: TypeDefs,
  resolvers: resolvers,
});

const handler = startServerAndCreateCloudflareWorkersHandler<
  Env,
  GraphQLContext
>(server, {
  context: async ({ request, env }) => {
    const db = drizzleProvider(env.DB);
    return {
      db,
      env,
    };
  },
});

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext) {
    return handler(request, env, ctx);
  },
};
