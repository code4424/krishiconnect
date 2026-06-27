import { Request, Response, NextFunction } from 'express';
import { NotificationService } from './notification.service.js';

export class NotificationController {
  static async getNotifications(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await NotificationService.getNotifications((req as any).user.id, req.query);
      res.json({ success: true, ...result });
    } catch (error) { next(error); }
  }

  static async markAsRead(req: Request, res: Response, next: NextFunction) {
    try {
      await NotificationService.markAsRead(req.params.id, (req as any).user.id);
      res.json({ success: true });
    } catch (error) { next(error); }
  }

  static async markAllAsRead(req: Request, res: Response, next: NextFunction) {
    try {
      await NotificationService.markAllAsRead((req as any).user.id);
      res.json({ success: true });
    } catch (error) { next(error); }
  }

  static async getUnreadCount(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await NotificationService.getUnreadCount((req as any).user.id);
      res.json({ success: true, data: result });
    } catch (error) { next(error); }
  }
}
