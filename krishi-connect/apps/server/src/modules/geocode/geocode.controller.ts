import { Request, Response, NextFunction } from 'express';
import { GeocodeService } from './geocode.service.js';

export class GeocodeController {
  static async search(req: Request, res: Response, next: NextFunction) {
    try {
      const { q } = req.query;
      if (!q) return res.status(400).json({ success: false, error: 'Query required' });
      const data = await GeocodeService.search(q as string);
      res.json({ success: true, data });
    } catch (error) { next(error); }
  }

  static async reverse(req: Request, res: Response, next: NextFunction) {
    try {
      const { lat, lng } = req.query;
      if (!lat || !lng) return res.status(400).json({ success: false, error: 'Coordinates required' });
      const data = await GeocodeService.reverse(Number(lat), Number(lng));
      res.json({ success: true, data });
    } catch (error) { next(error); }
  }
}
