import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const registerSchema = z.object({
  firstName: z.string().min(2, 'First name is too short'),
  lastName: z.string().min(2, 'Last name is too short'),
  email: z.string().email('Invalid email address'),
  phone: z.string().regex(/^[6-9]\d{9}$/, 'Invalid Indian phone number'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  role: z.enum(['FARMER', 'SERVICE_PROVIDER']),
  // Profile fields (conditional validation handled in controller or by making them optional here)
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  businessName: z.string().optional(),
  serviceCategories: z.array(z.string()).optional(),
  experience: z.number().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  pincode: z.string().optional(),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
