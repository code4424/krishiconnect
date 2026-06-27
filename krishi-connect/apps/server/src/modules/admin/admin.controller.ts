import { Request, Response, NextFunction } from 'express';
import { AdminService } from './admin.service.js';

export class AdminController {
  static async getStats(req: Request, res: Response, next: NextFunction) {
    try {
      const stats = await AdminService.getStats();
      res.json({ success: true, ...stats });
    } catch (error) { next(error); }
  }

  static async getProviders(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await AdminService.getProviders(req.query);
      res.json({ success: true, ...result });
    } catch (error) { next(error); }
  }

  static async getProviderById(req: Request, res: Response, next: NextFunction) {
    try {
      const provider = await AdminService.getProviderById(req.params.id);
      res.json({ success: true, data: provider });
    } catch (error) { next(error); }
  }

  static async updateProviderStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { status, reason } = req.body;
      const updated = await AdminService.updateProviderStatus(req.params.id, status, reason);
      res.json({ success: true, data: updated });
    } catch (error) { next(error); }
  }

  static async getProducts(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await AdminService.getProducts(req.query);
      res.json({ success: true, ...result });
    } catch (error) { next(error); }
  }

  static async updateProductStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { status, reason } = req.body;
      const updated = await AdminService.updateProductStatus(req.params.id, status, reason);
      res.json({ success: true, data: updated });
    } catch (error) { next(error); }
  }

  static async getBookings(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await AdminService.getBookings(req.query);
      res.json({ success: true, ...result });
    } catch (error) { next(error); }
  }

  static async getOrders(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await AdminService.getOrders(req.query);
      res.json({ success: true, ...result });
    } catch (error) { next(error); }
  }

  static async getReportsSummary(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await AdminService.getReportsSummary(req.query);
      res.json({ success: true, data: result });
    } catch (error) { next(error); }
  }

  static async getRevenueGrowth(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await AdminService.getRevenueGrowth();
      res.json({ success: true, data });
    } catch (error) { next(error); }
  }

  static async exportBookings(req: Request, res: Response, next: NextFunction) {
    try {
      const { data } = await AdminService.getBookings({ limit: 10000, status: 'ALL' });
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=bookings.csv');
      let csv = 'Booking ID,Farmer,Service,Provider,Date,Time,Status,Payment,Amount\n';
      data.forEach((b: any) => {
        csv += `${b.bookingId},${b.farmer.user.firstName} ${b.farmer.user.lastName},${b.service.name},${b.provider.businessName},${b.bookingDate},${b.startTime},${b.status},${b.paymentMethod},${b.totalAmount}\n`;
      });
      res.send(csv);
    } catch (error) { next(error); }
  }

  static async exportOrders(req: Request, res: Response, next: NextFunction) {
    try {
      const { data } = await AdminService.getOrders({ limit: 10000, status: 'ALL' });
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=orders.csv');
      let csv = 'Order ID,Farmer,Items,Amount,Status,Payment,Order Date\n';
      data.forEach((o: any) => {
        csv += `${o.orderId},${o.farmer.user.firstName} ${o.farmer.user.lastName},${o.items.length} items,${o.totalAmount},${o.status},${o.paymentMethod},${o.createdAt}\n`;
      });
      res.send(csv);
    } catch (error) { next(error); }
  }

  static async exportProviders(req: Request, res: Response, next: NextFunction) {
    try {
      const { data } = await AdminService.getProviders({ limit: 10000, status: 'ALL' });
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=providers.csv');

      let csv = 'Name,Email,Phone,Business Name,City,State,Status,Registered On\n';
      data.forEach((u: any) => {
        csv += `${u.firstName} ${u.lastName},${u.email},${u.phone},${u.providerProfile?.businessName || ''},${u.providerProfile?.city || ''},${u.providerProfile?.state || ''},${u.providerProfile?.approvalStatus},${u.createdAt}\n`;
      });

      res.send(csv);
    } catch (error) { next(error); }
  }

  static async exportProducts(req: Request, res: Response, next: NextFunction) {
    try {
      const { data } = await AdminService.getProducts({ limit: 10000, status: 'ALL' });
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=products.csv');

      let csv = 'Product Name,Provider,Category,Price,Stock,Status\n';
      data.forEach((p: any) => {
        csv += `${p.name},${p.provider.businessName},${p.category},${p.price},${p.stock},${p.approvalStatus}\n`;
      });

      res.send(csv);
    } catch (error) { next(error); }
  }

  static async getRevenueChart(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await AdminService.getRevenueChart();
      res.json({ success: true, data });
    } catch (error) { next(error); }
  }

  static async getBookingsOverview(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await AdminService.getBookingsOverview();
      res.json({ success: true, ...data });
    } catch (error) { next(error); }
  }

  static async getRecentActivities(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await AdminService.getRecentActivities();
      res.json({ success: true, data });
    } catch (error) { next(error); }
  }

  static async getTopServices(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await AdminService.getTopServices();
      res.json({ success: true, data });
    } catch (error) { next(error); }
  }

  static async getSettings(req: Request, res: Response, next: NextFunction) {
    try {
      const settings = await AdminService.getSettings();
      res.json({ success: true, data: settings });
    } catch (error) { next(error); }
  }

  static async updateSettings(req: Request, res: Response, next: NextFunction) {
    try {
      const { deliveryFee, freeDeliveryThreshold, convenienceCharges, platformCharges } = req.body;
      const numericFields: Record<string, number | undefined> = { deliveryFee, freeDeliveryThreshold, convenienceCharges, platformCharges };
      for (const [field, value] of Object.entries(numericFields)) {
        if (value !== undefined && (typeof value !== 'number' || value < 0)) {
          return res.status(400).json({ success: false, error: `${field} must be a non-negative number` });
        }
      }
      const settings = await AdminService.updateSettings(req.body);
      res.json({ success: true, data: settings });
    } catch (error) { next(error); }
  }
}
