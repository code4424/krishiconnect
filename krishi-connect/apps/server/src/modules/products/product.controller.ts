import { Request, Response, NextFunction } from 'express';
import { ProductService } from './product.service';

export class ProductController {
  static async createProduct(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) return res.status(401).json({ success: false, error: 'Unauthorized' });
      const result = await ProductService.createProduct(req.user.id, req.body);
      res.status(201).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  static async getProducts(req: Request, res: Response, next: NextFunction) {
    try {
      const { data, total } = await ProductService.getProducts(req.query);
      const page = parseInt(req.query.page as string || '1');
      const limit = parseInt(req.query.limit as string || '10');
      res.status(200).json({ success: true, data, meta: { page, limit, total } });
    } catch (error) {
      next(error);
    }
  }

  static async getProductById(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await ProductService.getProductById(req.params.id);
      if (!result) return res.status(404).json({ success: false, error: 'Product not found' });
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }
}
