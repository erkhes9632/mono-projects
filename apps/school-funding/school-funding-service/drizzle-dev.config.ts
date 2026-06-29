import 'dotenv/config';
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  out: './drizzle',
  schema: './src/db/index.ts',
  dialect: 'sqlite',

  dbCredentials: {
    url: '.wrangler/state/v3/d1/miniflare-D1DatabaseObject/e6bbebc7ba471e6aee134f4dc44e4bd6818ec92a9c45c898dd40abe070c74c28.sqlite',
  },
});
