import { describe, it, expect } from 'vitest';
import { createOrderSchema } from '../../../validators/order.js';

describe('Order Validators', () => {
  it('should validate correct order data', () => {
    const result = createOrderSchema.safeParse({
      items: [{ productId: 'p1', quantity: 2 }],
      deliveryAddress: {
        name: 'John Doe',
        address: '123 Farm St',
        city: 'Pune',
        state: 'MH',
        pincode: '411001',
        phone: '9876543210'
      },
      paymentMethod: 'CASH'
    });
    expect(result.success).toBe(true);
  });

  it('should fail for empty items list', () => {
    const result = createOrderSchema.safeParse({
      items: [],
      deliveryAddress: {
        name: 'John Doe',
        address: '123 Farm St',
        city: 'Pune',
        state: 'MH',
        pincode: '411001',
        phone: '9876543210'
      },
      paymentMethod: 'CASH'
    });
    expect(result.success).toBe(false);
  });
});
