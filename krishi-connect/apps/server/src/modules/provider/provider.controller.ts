import { Request, Response, NextFunction } from 'express';
import { ProviderService } from './provider.service.js';

export class ProviderController {
  static async getStats(req: Request, res: Response, next: NextFunction) {
    try {
      const stats = await ProviderService.getStats((req as any).user.id);
      res.json({ success: true, data: stats });
    } catch (error) { next(error); }
  }

  static async getEarningsChart(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await ProviderService.getEarningsChart((req as any).user.id);
      res.json({ success: true, data });
    } catch (error) { next(error); }
  }

  static async getBookingStatusOverview(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await ProviderService.getBookingStatusOverview((req as any).user.id);
      res.json({ success: true, data });
    } catch (error) { next(error); }
  }

  static async getUpcomingBookings(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await ProviderService.getUpcomingBookings((req as any).user.id);
      res.json({ success: true, data });
    } catch (error) { next(error); }
  }

  static async getRecentOrders(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await ProviderService.getRecentOrders((req as any).user.id);
      res.json({ success: true, data });
    } catch (error) { next(error); }
  }

  // --- Services ---
  static async getServices(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await ProviderService.getServices((req as any).user.id);
      res.json({ success: true, data });
    } catch (error) { next(error); }
  }

  static async getServiceById(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await ProviderService.getServiceById(req.params.id, (req as any).user.id);
      res.json({ success: true, data });
    } catch (error) { next(error); }
  }

  static async createService(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await ProviderService.createService((req as any).user.id, req.body);
      res.status(201).json({ success: true, data });
    } catch (error) { next(error); }
  }

  static async updateService(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await ProviderService.updateService(req.params.id, (req as any).user.id, req.body);
      res.json({ success: true, data });
    } catch (error) { next(error); }
  }

  static async deleteService(req: Request, res: Response, next: NextFunction) {
    try {
      await ProviderService.deleteService(req.params.id, (req as any).user.id);
      res.json({ success: true, message: 'Service deleted' });
    } catch (error) { next(error); }
  }

  // --- Products ---
  static async getProducts(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await ProviderService.getProducts((req as any).user.id);
      res.json({ success: true, data });
    } catch (error) { next(error); }
  }

  static async getProductById(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await ProviderService.getProductById(req.params.id, (req as any).user.id);
      res.json({ success: true, data });
    } catch (error) { next(error); }
  }

  static async createProduct(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await ProviderService.createProduct((req as any).user.id, req.body);
      res.status(201).json({ success: true, data });
    } catch (error) { next(error); }
  }

  static async updateProduct(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await ProviderService.updateProduct(req.params.id, (req as any).user.id, req.body);
      res.json({ success: true, data });
    } catch (error) { next(error); }
  }

  static async deleteProduct(req: Request, res: Response, next: NextFunction) {
    try {
      await ProviderService.deleteProduct(req.params.id, (req as any).user.id);
      res.json({ success: true, message: 'Product deleted' });
    } catch (error) { next(error); }
  }

  // --- Bookings ---
  static async getBookings(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await ProviderService.getBookings((req as any).user.id, req.query);
      res.json({ success: true, ...result });
    } catch (error) { next(error); }
  }

  static async getBookingById(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await ProviderService.getBookingById(req.params.id, (req as any).user.id);
      res.json({ success: true, data });
    } catch (error) { next(error); }
  }

  static async updateBookingStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { status, notes } = req.body;
      const data = await ProviderService.updateBookingStatus(req.params.id, (req as any).user.id, status, notes);
      res.json({ success: true, data });
    } catch (error) { next(error); }
  }

  // --- Orders ---
  static async getOrders(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await ProviderService.getOrders((req as any).user.id, req.query);
      res.json({ success: true, ...result });
    } catch (error) { next(error); }
  }

  static async updateOrderStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { status } = req.body;
      const data = await ProviderService.updateOrderStatus(req.params.id, (req as any).user.id, status);
      res.json({ success: true, data });
    } catch (error) { next(error); }
  }

  // --- Earnings ---
  static async getEarningsSummary(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await ProviderService.getEarningsSummary((req as any).user.id);
      res.json({ success: true, data });
    } catch (error) { next(error); }
  }

  static async getEarningsTransactions(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await ProviderService.getEarningsTransactions((req as any).user.id, req.query);
      res.json({ success: true, ...result });
    } catch (error) { next(error); }
  }

  // --- Profile ---
  static async getProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await ProviderService.getProfile((req as any).user.id);
      res.json({ success: true, data });
    } catch (error) { next(error); }
  }

  static async updateProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await ProviderService.updateProfile((req as any).user.id, req.body);
      res.json({ success: true, data });
    } catch (error) { next(error); }
  }
}
