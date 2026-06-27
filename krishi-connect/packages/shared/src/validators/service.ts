import { z } from 'zod';
import { SERVICE_CATEGORIES } from '../constants/categories.js';

export const createServiceSchema = z.object({
  title: z.string().min(3),
  description: z.string(),
  price: z.number().positive(),
  category: z.enum([...SERVICE_CATEGORIES] as [string, ...string[]]),
  location: z.object({
    lat: z.number(),
    lng: z.number(),
    address: z.string()
  }).optional(),
  images: z.array(z.string()).optional()
});
