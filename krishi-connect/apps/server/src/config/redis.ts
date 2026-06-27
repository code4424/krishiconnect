import Redis from 'ioredis';
import { env } from './env.js';

const redisOptions = {
  host: new URL(env.REDIS_URL).hostname,
  port: Number(new URL(env.REDIS_URL).port) || 6379,
  password: env.REDIS_PASSWORD,
  retryStrategy: (times: number) => {
    return Math.min(times * 50, 2000);
  }
};

export const redis = new Redis(env.REDIS_URL, {
  ...redisOptions
});

export const pubClient = new Redis(env.REDIS_URL, { ...redisOptions });
export const subClient = pubClient.duplicate();

export const redisConnectionOptions = redisOptions;

redis.on('error', (err) => {
  console.error('Redis connection error:', err);
});
