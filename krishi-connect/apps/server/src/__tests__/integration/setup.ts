import { prisma } from '../../config/database.js';
import { redis } from '../../config/redis.js';
import { generateAccessToken } from '../../utils/jwt.js';
import { Role } from '@krishi/shared';

export const truncateDB = async () => {
  const tablenames = await prisma.$queryRaw<Array<{ tablename: string }>>`
    SELECT tablename FROM pg_tables WHERE schemaname='public'
  `;

  for (const { tablename } of tablenames) {
    if (tablename !== '_prisma_migrations') {
      try {
        await prisma.$executeRawUnsafe(`TRUNCATE TABLE "public"."${tablename}" CASCADE;`);
      } catch (error) {
        console.log({ error });
      }
    }
  }
};

export const createTestUser = async (role: Role = 'FARMER') => {
  const user = await prisma.user.create({
    data: {
      email: `test-${Math.random()}@example.com`,
      phone: `9${Math.floor(Math.random() * 900000000) + 100000000}`,
      password: 'hashed-password',
      firstName: 'Test',
      lastName: 'User',
      role,
      isVerified: true
    }
  });

  const token = await generateAccessToken({ userId: user.id, email: user.email, role });
  return { user, token };
};

export const createTestFarmer = async () => {
  const { user, token } = await createTestUser('FARMER');
  const profile = await prisma.farmerProfile.create({
    data: {
      userId: user.id,
      city: 'Pune',
      state: 'MH',
      pincode: '411001',
      latitude: 18.5204,
      longitude: 73.8567
    }
  });
  return { user, profile, token };
};
