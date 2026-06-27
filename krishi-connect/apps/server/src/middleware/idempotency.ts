import { Request, Response, NextFunction } from 'express';
import { redis } from '../config/redis.js';

export const idempotencyCheck = async (req: Request, res: Response, next: NextFunction) => {
  const key = req.headers['x-idempotency-key'] as string;
  
  if (!key) return next();

  const cacheKey = `idempotency:${key}`;
  
  try {
    const cachedResponse = await redis.get(cacheKey);
    if (cachedResponse) {
      console.log(`Idempotency hit for key: ${key}`);
      const { status, body } = JSON.parse(cachedResponse);
      return res.status(status).json(body);
    }

    // Wrap res.json to capture the response and store it
    const originalJson = res.json;
    res.json = function(body: any) {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        redis.setex(cacheKey, 24 * 60 * 60, JSON.stringify({
          status: res.statusCode,
          body
        }));
      }
      return originalJson.call(this, body);
    };

    next();
  } catch (error) {
    next(); // Fail open
  }
};
