import { z } from 'zod';

export const createBookingSchema = z.object({
  serviceId: z.string().min(1, 'Service ID is required'),
  bookingDate: z.string().min(1, 'Booking date is required'),
  startTime: z.string().min(1, 'Start time is required'),
  duration: z.string().min(1, 'Duration is required'),
  paymentMethod: z.enum(['UPI_ONLINE', 'CASH', 'CARD']),
  farmerNotes: z.string().optional(),
});

export type CreateBookingInput = z.infer<typeof createBookingSchema>;
