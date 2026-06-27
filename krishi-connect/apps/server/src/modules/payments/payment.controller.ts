import { Request, Response, NextFunction } from 'express';
import { PaymentService } from './payment.service.js';

export class PaymentController {
  static async createOrder(req: Request, res: Response, next: NextFunction) {
    try {
      const { amount, bookingId, orderId } = req.body;
      const result = await PaymentService.createOrder({
        amount,
        userId: (req as any).user.id,
        bookingId,
        orderId
      });
      res.json({ success: true, data: result });
    } catch (error) { next(error); }
  }

  static async verify(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await PaymentService.verifyPayment(req.body);
      res.json({ success: true, data: result });
    } catch (error) { next(error); }
  }

  static async webhook(req: Request, res: Response, next: NextFunction) {
    // Razorpay Webhook signature verification logic here
    res.json({ status: 'ok' });
  }

  static async history(req: Request, res: Response, next: NextFunction) {
    // Return payment history for user
    res.json({ success: true, data: [] });
  }
}
