import { Request, Response, NextFunction } from 'express';
import { ServiceService } from './service.service';

export class ServiceController {
  static async createService(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) return res.status(401).json({ success: false, error: 'Unauthorized' });
      
      const result = await ServiceService.createService(req.user.id, req.body);
      res.status(201).json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  static async getServices(req: Request, res: Response, next: NextFunction) {
    try {
      const { data, total } = await ServiceService.getServices(req.query);
      const page = parseInt(req.query.page as string || '1');
      const limit = parseInt(req.query.limit as string || '10');
      
      res.status(200).json({
        success: true,
        data,
        meta: {
          page,
          limit,
          total
        }
      });
    } catch (error) {
      next(error);
    }
  }

  static async getServiceById(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await ServiceService.getServiceById(req.params.id);
      if (!result) {
        return res.status(404).json({ success: false, error: 'Service not found' });
      }
      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateService(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) return res.status(401).json({ success: false, error: 'Unauthorized' });
      
      const result = await ServiceService.updateService(req.params.id, req.user.id, req.body);
      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error: any) {
      if (error.message === 'Service not found') {
        res.status(404).json({ success: false, error: error.message });
      } else if (error.message === 'Unauthorized') {
        res.status(403).json({ success: false, error: error.message });
      } else {
        next(error);
      }
    }
  }

  static async deleteService(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) return res.status(401).json({ success: false, error: 'Unauthorized' });
      
      await ServiceService.deleteService(req.params.id, req.user.id);
      res.status(200).json({
        success: true,
        data: { id: req.params.id }
      });
    } catch (error: any) {
      if (error.message === 'Service not found') {
        res.status(404).json({ success: false, error: error.message });
      } else if (error.message === 'Unauthorized') {
        res.status(403).json({ success: false, error: error.message });
      } else {
        next(error);
      }
    }
  }
}
