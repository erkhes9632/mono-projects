import 'dotenv/config';
import pg from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

const connectionString = `${process.env['DATABASE_URL']}`;

const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);

export const db =
  globalThis.prisma ||
  new PrismaClient({
    adapter,
    log:
      process.env['NODE_ENV'] === 'development'
        ? ['query', 'warn', 'info']
        : ['error'],
  });

if (process.env['NODE_ENV'] === 'production') globalThis.prisma = db;
