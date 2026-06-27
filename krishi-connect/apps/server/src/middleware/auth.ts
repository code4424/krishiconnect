import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt.js';
import { redis } from '../config/redis.js';
import { prisma } from '../config/database.js';

export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  let token = (req as any).cookies?.accessToken;
  if (!token) {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    }
  }
  if (!token) {
    return res.status(401).json({ success: false, error: 'Unauthorized: No token provided' });
  }

  try {
    // 1. Check Blacklist in Redis
    const isBlacklisted = await redis.get(`blacklist:${token}`);
    if (isBlacklisted) {
      return res.status(401).json({ success: false, error: 'Token is no longer valid' });
    }

    // 2. Verify JWT
    const decoded = await verifyToken(token);

    // 3. Attach User (Cache User lookup in Redis for 5 mins)
    const cachedUser = await redis.get(`user:${decoded.userId}`);
    let user;

    if (cachedUser) {
      user = JSON.parse(cachedUser);
    } else {
      user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        include: {
          farmerProfile: true,
          providerProfile: true,
        },
      });

      if (user) {
        await redis.setex(`user:${decoded.userId}`, 300, JSON.stringify(user));
      }
    }

    if (!user || !user.isActive) {
      return res.status(401).json({ success: false, error: 'User not found or inactive' });
    }

    (req as any).user = user;
    (req as any).token = token;
    (req as any).tokenExp = decoded.exp;

    next();
  } catch (error: any) {
    return res.status(401).json({ success: false, error: 'Invalid or expired token' });
  }
};
