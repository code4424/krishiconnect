import { Request, Response, NextFunction } from 'express';
import { BookingService } from './booking.service';

export class BookingController {
  static async createBooking(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) return res.status(401).json({ success: false, error: 'Unauthorized' });
      const result = await BookingService.createBooking(req.user.id, req.body);
      res.status(201).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  static async getBookings(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) return res.status(401).json({ success: false, error: 'Unauthorized' });
      
      const { data, total } = await BookingService.getBookings(req.user.id, req.user.role, req.query);
      const page = parseInt(req.query.page as string || '1');
      const limit = parseInt(req.query.limit as string || '10');
      
      res.status(200).json({ success: true, data, meta: { page, limit, total } });
    } catch (error) {
      next(error);
    }
  }

  static async updateStatus(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) return res.status(401).json({ success: false, error: 'Unauthorized' });
      
      const result = await BookingService.updateBookingStatus(req.params.id, req.user.id, req.body.status);
      res.status(200).json({ success: true, data: result });
    } catch (error: any) {
      if (error.message === 'Booking not found') {
        res.status(404).json({ success: false, error: error.message });
      } else if (error.message === 'Unauthorized') {
        res.status(403).json({ success: false, error: error.message });
      } else {
        next(error);
      }
    }
  }
}
