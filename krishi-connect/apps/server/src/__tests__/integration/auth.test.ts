import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../app.js';
import { truncateDB } from './setup.js';
import { prisma } from '../config/database.js';

describe('Auth Integration', () => {
  beforeEach(async () => {
    await truncateDB();
  });

  it('should register a new farmer', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        phone: '9876543210',
        password: 'password123',
        role: 'FARMER',
        city: 'Pune',
        state: 'MH',
        pincode: '411001'
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.email).toBe('john@example.com');
    expect(res.body.data.accessToken).toBeDefined();

    const user = await prisma.user.findUnique({
      where: { email: 'john@example.com' },
      include: { farmerProfile: true }
    });
    expect(user?.farmerProfile).toBeDefined();
    expect(user?.farmerProfile?.city).toBe('Pune');
  });

  it('should register a provider with PENDING status', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        firstName: 'Arjun',
        lastName: 'Patel',
        email: 'arjun@example.com',
        phone: '9000000001',
        password: 'password123',
        role: 'SERVICE_PROVIDER',
        businessName: 'Patel Agri',
        experience: 5,
        city: 'Indore',
        state: 'MP',
        pincode: '452001'
      });

    expect(res.status).toBe(201);
    const profile = await prisma.providerProfile.findFirst({
      where: { businessName: 'Patel Agri' }
    });
    expect(profile?.approvalStatus).toBe('PENDING');
  });

  it('should fail login for non-existent user', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'non@existent.com', password: 'password123' });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });
});
