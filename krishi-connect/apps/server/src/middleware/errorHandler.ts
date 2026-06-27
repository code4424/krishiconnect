import { Request, Response, NextFunction } from 'express';
import { env } from '../config/env.js';
import { ZodError } from 'zod';
import { API_ERRORS } from '../i18n/errors.js';

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error(err);

  // Determine language (priority: user preference > header > default en)
  const lang = ((req as any).user?.preferredLanguage?.toLowerCase()) || 
               (req.headers['accept-language']?.startsWith('kn') ? 'kn' : 'en');

  if (err instanceof ZodError) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: err.errors
    });
  }

  const errorCode = err.message as keyof typeof API_ERRORS.en;
  const translatedMessage = API_ERRORS[lang]?.[errorCode] || API_ERRORS.en[errorCode] || err.message || 'Internal Server Error';

  const statusCode = err.statusCode || (err.message.includes('not found') ? 404 : 500);

  res.status(statusCode).json({
    success: false,
    error: translatedMessage,
    ...(env.NODE_ENV !== 'production' && { stack: err.stack })
  });
};

