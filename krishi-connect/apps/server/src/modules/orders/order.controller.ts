import { Request, Response, NextFunction } from 'express';
import { OrderService } from './order.service';

export class OrderController {
  static async createOrder(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) return res.status(401).json({ success: false, error: 'Unauthorized' });
      const result = await OrderService.createOrder(req.user.id, req.body);
      res.status(201).json({ success: true, data: result });
    } catch (error: any) {
      if (error.message.includes('Insufficient stock') || error.message.includes('not found')) {
        res.status(400).json({ success: false, error: error.message });
      } else {
        next(error);
      }
    }
  }

  static async getOrders(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) return res.status(401).json({ success: false, error: 'Unauthorized' });
      const { data, total } = await OrderService.getOrders(req.user.id, req.user.role, req.query);
      const page = parseInt(req.query.page as string || '1');
      const limit = parseInt(req.query.limit as string || '10');
      res.status(200).json({ success: true, data, meta: { page, limit, total } });
    } catch (error) {
      next(error);
    }
  }
}
