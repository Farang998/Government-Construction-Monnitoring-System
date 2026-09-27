import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const EnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(5000),
  DATABASE_URL: z
    .string()
    .default('postgresql://postgres:postgrespassword@localhost:5432/gov_construction_db?schema=public'),
  REDIS_URL: z.string().default('redis://localhost:6379'),
  JWT_SECRET: z.string().default('default_gov_development_secret_key_32_bytes_min'),
  JWT_EXPIRES_IN: z.string().default('8h'),
  CORS_ORIGIN: z.string().default('http://localhost:5173'),
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'http', 'debug']).default('info'),
  UPLOAD_DIR: z.string().default('./uploads'),
});

const parsed = EnvSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('CRITICAL: Environment variable validation failed:', parsed.error.format());
  process.exit(1);
}

export const config = parsed.data;
