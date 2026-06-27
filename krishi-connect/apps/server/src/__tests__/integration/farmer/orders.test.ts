import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../../app.js';
import { truncateDB, createTestFarmer } from '../setup.js';
import { prisma } from '../../../config/database.js';

describe('Farmer Orders Integration', () => {
  let farmerToken: string;

  beforeEach(async () => {
    await truncateDB();
    const farmer = await createTestFarmer();
    farmerToken = farmer.token;
  });

  it('should place an order and decrement stock', async () => {
    // 1. Setup Provider and Product
    const provider = await prisma.user.create({
      data: {
        email: 'p@ex.com', phone: '9000000004', password: 'h', role: 'SERVICE_PROVIDER', firstName: 'P', lastName: 'P',
        providerProfile: {
          create: { businessName: 'B', experience: 1, address: 'A', city: 'C', state: 'S', pincode: 'P', latitude: 0, longitude: 0, approvalStatus: 'APPROVED' }
        }
      },
      include: { providerProfile: true }
    });

    const product = await prisma.product.create({
      data: {
        providerId: provider.providerProfile!.id,
        name: 'Organic Wheat Seeds',
        category: 'SEEDS',
        description: 'D',
        price: 120,
        stock: 50,
        approvalStatus: 'APPROVED'
      }
    });

    // 2. Place order
    const res = await request(app)
      .post('/api/farmer/orders')
      .set('Authorization', `Bearer ${farmerToken}`)
      .send({
        items: [{ productId: product.id, quantity: 2 }],
        paymentMethod: 'CASH',
        deliveryAddress: {
          name: 'Ramesh', address: '123 Farm', city: 'Pune', state: 'MH', pincode: '411001', phone: '9876543210'
        }
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.totalAmount).toBe(240 + 60); // (120*2) + 60 delivery

    // 3. Verify Stock
    const updatedProduct = await prisma.product.findUnique({ where: { id: product.id } });
    expect(updatedProduct?.stock).toBe(48);
  });

  it('should fail if stock is insufficient', async () => {
    // (Setup same as above but request quantity 100)
    // res.status should be 400
  });
});
