import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import { Context } from './types/index';
import { userTypeDefs, todoTypeDefs } from './graphql/schema';
import { resolvers } from './graphql/resolvers/index';
import { db } from './config/db';

const startServer = async () => {
  const server = new ApolloServer<Context>({
    typeDefs: [userTypeDefs, todoTypeDefs],
    resolvers: resolvers,
  });

  const { url } = await startStandaloneServer<Context>(server, {
    listen: { port: Number(process.env['PORT']) || 4001 },
    context: async ({ req }) => {
      return { db };
    },
  });
};

startServer().catch((err) => {
  console.error(err);
});
