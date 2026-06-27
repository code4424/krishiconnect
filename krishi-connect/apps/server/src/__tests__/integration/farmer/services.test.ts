import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../../app.js';
import { truncateDB, createTestFarmer } from '../setup.js';
import { prisma } from '../../../config/database.js';

describe('Service Discovery Integration', () => {
  let farmerToken: string;

  beforeEach(async () => {
    await truncateDB();
    const farmer = await createTestFarmer();
    farmerToken = farmer.token;
  });

  it('should filter services by distance', async () => {
    // 1. Create a provider near (Pune)
    const nearProvider = await prisma.user.create({
      data: {
        email: 'near@ex.com', phone: '9000000005', password: 'h', role: 'SERVICE_PROVIDER', firstName: 'N', lastName: 'N',
        providerProfile: {
          create: { businessName: 'Near', experience: 1, address: 'A', city: 'Pune', state: 'S', pincode: 'P', latitude: 18.5204, longitude: 73.8567, approvalStatus: 'APPROVED' }
        }
      },
      include: { providerProfile: true }
    });

    await prisma.service.create({
      data: { providerId: nearProvider.providerProfile!.id, name: 'Near Service', category: 'TRACTOR', description: 'D', price: 1000, rateType: 'PER_HOUR' }
    });

    // 2. Create a provider far (Indore - ~600km)
    const farProvider = await prisma.user.create({
      data: {
        email: 'far@ex.com', phone: '9000000006', password: 'h', role: 'SERVICE_PROVIDER', firstName: 'F', lastName: 'F',
        providerProfile: {
          create: { businessName: 'Far', experience: 1, address: 'A', city: 'Indore', state: 'S', pincode: 'P', latitude: 22.7196, longitude: 75.8577, approvalStatus: 'APPROVED' }
        }
      },
      include: { providerProfile: true }
    });

    await prisma.service.create({
      data: { providerId: farProvider.providerProfile!.id, name: 'Far Service', category: 'TRACTOR', description: 'D', price: 1000, rateType: 'PER_HOUR' }
    });

    // 3. Search near Pune (Farmer is at 18.5204, 73.8567)
    const res = await request(app)
      .get('/api/farmer/services')
      .set('Authorization', `Bearer ${farmerToken}`)
      .query({ lat: 18.5204, lng: 73.8567, radius: 50 });

    expect(res.status).toBe(200);
    expect(res.body.data.length).toBe(1);
    expect(res.body.data[0].name).toBe('Near Service');
  });
});
