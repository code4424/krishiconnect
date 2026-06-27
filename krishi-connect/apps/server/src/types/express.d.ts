import { User } from '@krishi/shared';

declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}
