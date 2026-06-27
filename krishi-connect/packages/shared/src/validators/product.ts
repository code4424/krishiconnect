import { z } from 'zod';
import { PRODUCT_CATEGORIES } from '../constants/categories.js';

export const createProductSchema = z.object({
  name: z.string().min(2),
  description: z.string(),
  price: z.number().positive(),
  stock: z.number().int().nonnegative(),
  category: z.enum([...PRODUCT_CATEGORIES] as [string, ...string[]]),
  images: z.array(z.string()).optional()
});
