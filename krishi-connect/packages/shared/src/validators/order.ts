import { z } from 'zod';

export const createOrderSchema = z.object({
  items: z.array(z.object({
    productId: z.string().min(1),
    quantity: z.number().int().positive(),
  })).min(1, 'Cart cannot be empty'),
  deliveryAddress: z.object({
    name: z.string().min(2),
    address: z.string().min(5),
    city: z.string().min(2),
    state: z.string().min(2),
    pincode: z.string().regex(/^\d{6}$/, 'Invalid pincode'),
    phone: z.string().regex(/^[6-9]\d{9}$/, 'Invalid phone number'),
  }),
  paymentMethod: z.enum(['UPI_ONLINE', 'CASH', 'CARD']),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;
