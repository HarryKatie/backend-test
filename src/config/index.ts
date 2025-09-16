import dotenv from 'dotenv';
import { z } from 'zod';

// Load environment variables
dotenv.config();

// Environment variables schema
const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().transform(Number).default('5012'),
  HOST: z.string().default('localhost'),
  MONGODB_URI: z.string(),
  MONGODB_URI_TEST: z.string().optional(),
  JWT_SECRET: z.string(),
  JWT_EXPIRES_IN: z.string().default('7d'),
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
  LOG_FILE: z.string().default('logs/app.log'),
  RATE_LIMIT_WINDOW_MS: z.string().transform(Number).default('900000'),
  RATE_LIMIT_MAX_REQUESTS: z.string().transform(Number).default('100'),
  CORS_ORIGIN: z.string().default('http://localhost:5012'),
  EMAIL_HOST: z.string(),
  EMAIL_PORT: z.string().transform(Number),
  EMAIL_USER: z.string(),
  EMAIL_PASS: z.string(),
  FRONTEND_URL: z.string(),
  EMAIL_FROM: z.string().default('no-reply@example.com'),
  BCRYPT_ROUNDS: z.string().transform(Number).default('12'),
  SSL_KEY_PATH: z.string().optional(),
  SSL_CERT_PATH: z.string().optional(),
});

// Validate environment variables
const env = envSchema.parse(process.env);

// Configuration objects
export const config = {
  server: {
    port: env.PORT,
    host: env.HOST,
    nodeEnv: env.NODE_ENV,
    isDevelopment: env.NODE_ENV === 'development',
    isProduction: env.NODE_ENV === 'production',
    isTest: env.NODE_ENV === 'test',
    sslKeyPath: env.SSL_KEY_PATH,
    sslCertPath: env.SSL_CERT_PATH,
  },
  database: {
    uri: env.NODE_ENV === 'test' ? env.MONGODB_URI_TEST || env.MONGODB_URI : env.MONGODB_URI,
    options: {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    },
  },
  jwt: {
    secret: env.JWT_SECRET,
    expiresIn: env.JWT_EXPIRES_IN,
  },
  email: {
    host: env.EMAIL_HOST,
    port: env.EMAIL_PORT,
    user: env.EMAIL_USER,
    pass: env.EMAIL_PASS,
    from: env.EMAIL_FROM,
  },
  logging: {
    level: env.LOG_LEVEL,
    file: env.LOG_FILE,
  },
  rateLimit: {
    windowMs: env.RATE_LIMIT_WINDOW_MS,
    max: env.RATE_LIMIT_MAX_REQUESTS,
  },
  cors: {
    // origin: env.CORS_ORIGIN,
    origin: "*", // env.CORS_ORIGIN.split(',').map(o => o.trim()),
  },
  security: {
    bcryptRounds: env.BCRYPT_ROUNDS,
  },
  frontendUrl: env.FRONTEND_URL,
} as const;

export type Config = typeof config; 