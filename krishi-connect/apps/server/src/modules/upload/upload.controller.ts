import { Request, Response, NextFunction } from 'express';

export class UploadController {
  static async uploadImages(req: Request, res: Response, next: NextFunction) {
    try {
      const files = req.files as Express.Multer.File[];
      if (!files || files.length === 0) {
        return res.status(400).json({ success: false, error: 'No files uploaded' });
      }

      // Construct full URLs
      const urls = files.map(file => {
        const protocol = req.protocol;
        const host = req.get('host');
        return `${protocol}://${host}/uploads/${file.filename}`;
      });

      res.status(200).json({ success: true, urls });
    } catch (error) {
      next(error);
    }
  }
}
