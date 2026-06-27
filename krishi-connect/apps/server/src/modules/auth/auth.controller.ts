import { Request, Response, NextFunction } from 'express';
import { AuthService } from './auth.service.js';

const setAuthCookies = (res: Response, accessToken: string, refreshToken: string) => {
  res.cookie('accessToken', accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 15 * 60 * 1000, // 15 minutes
    path: '/',
  });
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: '/',
  });
};

export class AuthController {
  static async register(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await AuthService.register(req.body);
      setAuthCookies(res, result.accessToken, result.refreshToken);
      res.status(201).json({ success: true, data: result });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await AuthService.login(req.body);
      setAuthCookies(res, result.accessToken, result.refreshToken);
      res.status(200).json({ success: true, data: result });
    } catch (error: any) {
      const status = error.message.includes('pending') ? 403 : 401;
      res.status(status).json({ success: false, error: error.message });
    }
  }

  static async refresh(req: Request, res: Response, next: NextFunction) {
    try {
      const refreshToken = (req as any).cookies?.refreshToken || req.body.refreshToken;
      if (!refreshToken) throw new Error('Refresh token required');
      const result = await AuthService.refresh(refreshToken);
      setAuthCookies(res, result.accessToken, result.refreshToken);
      res.status(200).json({ success: true, data: result });
    } catch (error: any) {
      res.status(401).json({ success: false, error: error.message });
    }
  }

  static async logout(req: Request, res: Response, next: NextFunction) {
    try {
      const user = (req as any).user;
      const token = (req as any).token;
      const exp = (req as any).tokenExp;
      await AuthService.logout(user.id, token, exp);
      res.clearCookie('accessToken', { path: '/' });
      res.clearCookie('refreshToken', { path: '/' });
      res.status(200).json({ success: true, message: 'Logged out successfully' });
    } catch (error: any) {
      next(error);
    }
  }

  static async getMe(req: Request, res: Response, next: NextFunction) {
    try {
      const { password: _, ...user } = (req as any).user;
      res.status(200).json({ success: true, data: { user } });
    } catch (error) {
      next(error);
    }
  }

  static async updateLanguage(req: Request, res: Response, next: NextFunction) {
    try {
      const { language } = req.body;
      if (!language || !['EN', 'KN'].includes(language)) {
        return res.status(400).json({ success: false, error: 'Invalid language' });
      }
      await AuthService.updateLanguage((req as any).user.id, language);
      res.json({ success: true });
    } catch (error) {
      next(error);
    }
  }
}
