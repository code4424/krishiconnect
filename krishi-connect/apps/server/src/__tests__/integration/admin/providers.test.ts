import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../../app.js';
import { truncateDB, createTestUser } from '../setup.js';
import { prisma } from '../../../config/database.js';

describe('Admin Provider Management Integration', () => {
  let adminToken: string;

  beforeEach(async () => {
    await truncateDB();
    const admin = await createTestUser('ADMIN');
    adminToken = admin.token;
  });

  it('should approve a pending provider', async () => {
    // 1. Create a pending provider
    const providerUser = await prisma.user.create({
      data: {
        email: 'provider@example.com',
        phone: '9000000002',
        password: 'password123',
        role: 'SERVICE_PROVIDER',
        firstName: 'Vikram',
        lastName: 'Joshi',
        providerProfile: {
          create: {
            businessName: 'Joshi Rentals',
            experience: 10,
            address: 'Addr', city: 'Pune', state: 'MH', pincode: '411001', latitude: 0, longitude: 0,
            approvalStatus: 'PENDING'
          }
        }
      }
    });

    // 2. Approve via Admin API
    const res = await request(app)
      .put(`/api/admin/providers/${providerUser.id}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'APPROVED' });

    expect(res.status).toBe(200);
    
    const updatedProfile = await prisma.providerProfile.findUnique({
      where: { userId: providerUser.id }
    });
    expect(updatedProfile?.approvalStatus).toBe('APPROVED');
    
    // Check notification
    const notification = await prisma.notification.findFirst({
      where: { userId: providerUser.id }
    });
    expect(notification?.title).toContain('approved');
  });

  it('should return 403 for non-admin attempting access', async () => {
    const farmer = await createTestUser('FARMER');
    const res = await request(app)
      .get('/api/admin/providers')
      .set('Authorization', `Bearer ${farmer.token}`);

    expect(res.status).toBe(403);
  });
});
