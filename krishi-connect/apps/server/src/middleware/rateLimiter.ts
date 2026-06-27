import { redis } from '../config/redis.js';
import { Request, Response, NextFunction } from 'express';

interface RateLimitOptions {
  windowMs: number;
  max: number;
  keyPrefix: string;
}

const createLimiter = (options: RateLimitOptions) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    const key = `ratelimit:${options.keyPrefix}:${ip}`;

    try {
      const current = await redis.incr(key);
      
      if (current === 1) {
        await redis.pexpire(key, options.windowMs);
      }

      if (current > options.max) {
        return res.status(429).json({
          success: false,
          error: 'Too many requests, please try again later.',
        });
      }

      next();
    } catch (error) {
      console.error('Rate limiter error:', error);
      next(); // Fail open for production reliability
    }
  };
};

import { env } from '../config/env.js';

export const loginLimiter = createLimiter({
  windowMs: env.NODE_ENV === 'development' ? 1 * 60 * 1000 : 15 * 60 * 1000, // 1 min for dev
  max: env.NODE_ENV === 'development' ? 100 : 5,
  keyPrefix: 'login'
});

export const registerLimiter = createLimiter({
  windowMs: env.NODE_ENV === 'development' ? 1 * 60 * 1000 : 60 * 60 * 1000, // 1 min for dev
  max: env.NODE_ENV === 'development' ? 50 : 3,
  keyPrefix: 'register'
});

export const apiLimiter = async (req: Request, res: Response, next: NextFunction) => {
  // If user is authenticated, use userId, else fallback to IP
  const identifier = (req as any).user?.id || req.ip || 'unknown';
  const key = `ratelimit:api:${identifier}`;

  try {
    const current = await redis.incr(key);
    if (current === 1) {
      await redis.expire(key, 60); // 1 minute
    }

    if (current > 100) {
      return res.status(429).json({
        success: false,
        error: 'Rate limit exceeded. 100 requests per minute allowed.',
      });
    }
    next();
  } catch (error) {
    next();
  }
};
