import { describe, it, expect } from 'vitest';
import { createBookingSchema } from '../../../validators/booking.js';

describe('Booking Validators', () => {
  it('should validate correct booking data', () => {
    const result = createBookingSchema.safeParse({
      serviceId: 'uuid-123',
      bookingDate: '2024-05-20T10:00:00Z',
      startTime: '10:00 AM',
      duration: '2 Hours',
      paymentMethod: 'UPI_ONLINE'
    });
    expect(result.success).toBe(true);
  });

  it('should fail for invalid payment method', () => {
    const result = createBookingSchema.safeParse({
      serviceId: 'uuid-123',
      bookingDate: '2024-05-20T10:00:00Z',
      startTime: '10:00 AM',
      duration: '2 Hours',
      paymentMethod: 'BITCOIN'
    });
    expect(result.success).toBe(false);
  });
});
