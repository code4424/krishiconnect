import { Request, Response, NextFunction } from 'express';
import { Role } from '@krishi/shared';

export const rbac = (...allowedRoles: Role[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user;

    if (!user) {
      return res.status(401).json({ success: false, error: 'Authentication required' });
    }

    if (!allowedRoles.includes(user.role)) {
      return res.status(403).json({
        success: false,
        error: `Access forbidden: Required role [${allowedRoles.join(', ')}]`,
      });
    }

    next();
  };
};

export const requireRole = (allowedRoles: Role[]) => rbac(...allowedRoles);
