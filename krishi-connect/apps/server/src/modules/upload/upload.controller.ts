import { Request, Response, NextFunction } from 'express';
import path from 'path';
import { supabase, SUPABASE_BUCKET } from '../../config/supabase.js';
import { env } from '../../config/env.js';

export class UploadController {
  static async uploadImages(req: Request, res: Response, next: NextFunction) {
    try {
      const files = req.files as Express.Multer.File[];
      if (!files || files.length === 0) {
        return res.status(400).json({ success: false, error: 'No files uploaded' });
      }

      const urls: string[] = [];

      for (const file of files) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const fileName = `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`;
        const filePath = `uploads/${fileName}`;

        const { error } = await supabase.storage
          .from(SUPABASE_BUCKET)
          .upload(filePath, file.buffer, {
            contentType: file.mimetype,
            upsert: false,
          });

        if (error) {
          throw new Error(`Upload failed: ${error.message}`);
        }

        const { data } = supabase.storage
          .from(SUPABASE_BUCKET)
          .getPublicUrl(filePath);

        urls.push(data.publicUrl);
      }

      res.status(200).json({ success: true, urls });
    } catch (error) {
      next(error);
    }
  }
}
