import { Request, Response, NextFunction } from 'express';
import { FarmerService } from './farmer.service.js';

export class FarmerController {
  static async getDashboard(req: Request, res: Response, next: NextFunction) {
    try {
      const { lat, lng } = req.query;
      const data = await FarmerService.getDashboardData((req as any).user.id, lat as any, lng as any);
      res.json({ success: true, data });
    } catch (error) { next(error); }
  }

  static async searchServices(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await FarmerService.searchServices(req.query);
      res.json({ success: true, ...result });
    } catch (error) { next(error); }
  }

  static async getServiceById(req: Request, res: Response, next: NextFunction) {
    try {
      const { lat, lng } = req.query;
      const data = await FarmerService.getServiceById(req.params.id, Number(lat), Number(lng));
      res.json({ success: true, data });
    } catch (error) { next(error); }
  }

  static async getAvailableSlots(req: Request, res: Response, next: NextFunction) {
    try {
      const { date } = req.query;
      const data = await FarmerService.getAvailableSlots(req.params.id, date as string);
      res.json({ success: true, data });
    } catch (error) { next(error); }
  }

  static async createBooking(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await FarmerService.createBooking((req as any).user.id, req.body);
      res.status(201).json({ success: true, data });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  static async getBookings(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await FarmerService.getBookings((req as any).user.id, req.query);
      res.json({ success: true, data });
    } catch (error) { next(error); }
  }

  static async getBookingById(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await FarmerService.getBookingById(req.params.id, (req as any).user.id);
      res.json({ success: true, data });
    } catch (error) { next(error); }
  }

  static async cancelBooking(req: Request, res: Response, next: NextFunction) {
    try {
      const { reason } = req.body;
      const data = await FarmerService.cancelBooking(req.params.id, (req as any).user.id, reason);
      res.json({ success: true, data });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  static async getServicesMap(req: Request, res: Response, next: NextFunction) {
    try {
      // Re-use search with specific lightweight mapping
      const result = await FarmerService.searchServices({ ...req.query, limit: 100 });
      const markers = result.data.map((s: any) => ({
        id: s.id,
        name: s.name,
        price: s.price,
        lat: s.latitude,
        lng: s.longitude,
        rating: s.averageRating,
        category: s.category
      }));
      res.json({ success: true, data: markers });
    } catch (error) { next(error); }
  }

  // --- Products ---
  static async getProducts(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await FarmerService.getProducts(req.query);
      res.json({ success: true, ...result });
    } catch (error) { next(error); }
  }

  static async getProductById(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await FarmerService.getProductById(req.params.id);
      res.json({ success: true, data });
    } catch (error: any) {
      res.status(404).json({ success: false, error: error.message });
    }
  }

  // --- Orders ---
  static async createOrder(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await FarmerService.createOrder((req as any).user.id, req.body);
      res.status(201).json({ success: true, data });
    } catch (error: any) {
      console.error('Order creation failed:', error.message);
      res.status(400).json({ success: false, error: error.message });
    }
  }

  static async getOrders(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await FarmerService.getOrders((req as any).user.id, req.query);
      res.json({ success: true, data });
    } catch (error) { next(error); }
  }

  static async getOrderById(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await FarmerService.getOrderById(req.params.id, (req as any).user.id);
      res.json({ success: true, data });
    } catch (error: any) {
      res.status(404).json({ success: false, error: error.message });
    }
  }

  static async cancelOrder(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await FarmerService.cancelOrder(req.params.id, (req as any).user.id);
      res.json({ success: true, data });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  static async getPlatformSettings(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await FarmerService.getPlatformSettings();
      res.json({ success: true, data });
    } catch (error) { next(error); }
  }

  // --- Addresses ---
  static async getAddresses(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await FarmerService.getAddresses((req as any).user.id);
      res.json({ success: true, data });
    } catch (error) { next(error); }
  }

  static async addAddress(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await FarmerService.addAddress((req as any).user.id, req.body);
      res.status(201).json({ success: true, data });
    } catch (error) { next(error); }
  }

  static async updateAddress(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await FarmerService.updateAddress(req.params.id, (req as any).user.id, req.body);
      res.json({ success: true, data });
    } catch (error) { next(error); }
  }

  static async deleteAddress(req: Request, res: Response, next: NextFunction) {
    try {
      await FarmerService.deleteAddress(req.params.id, (req as any).user.id);
      res.json({ success: true, message: 'Address deleted' });
    } catch (error) { next(error); }
  }
}
