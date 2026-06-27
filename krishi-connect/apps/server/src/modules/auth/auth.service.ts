import { prisma } from '../../config/database.js';
import { redis } from '../../config/redis.js';
import { hashPassword, verifyPassword } from '../../utils/password.js';
import { generateAccessToken, generateRefreshToken, verifyToken } from '../../utils/jwt.js';
import { Role, ApprovalStatus } from '@krishi/shared';

export class AuthService {
  static async register(data: any) {
    const { firstName, lastName, email, phone, password, role, ...profileData } = data;

    const existingUser = await prisma.user.findFirst({
      where: { OR: [{ email }, { phone }] }
    });

    if (existingUser) {
      throw new Error('Email or phone already registered');
    }

    const hashedPassword = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        firstName,
        lastName,
        email,
        phone,
        password: hashedPassword,
        role: role as Role,
        isActive: true,
        isVerified: false,
        ...(role === 'FARMER' ? {
          farmerProfile: {
            create: {
              farmSize: profileData.farmSize || 0,
              farmAddress: profileData.address || '',
              city: profileData.city || '',
              state: profileData.state || '',
              pincode: profileData.pincode || '',
              latitude: profileData.latitude || 0,
              longitude: profileData.longitude || 0,
            }
          }
        } : {
          providerProfile: {
            create: {
              businessName: profileData.businessName || `${firstName}'s Services`,
              serviceCategories: profileData.serviceCategories || [],
              experience: profileData.experience || 0,
              address: profileData.address || '',
              city: profileData.city || '',
              state: profileData.state || '',
              pincode: profileData.pincode || '',
              latitude: profileData.latitude || 0,
              longitude: profileData.longitude || 0,
              approvalStatus: 'PENDING',
            }
          }
        })
      },
      include: {
        farmerProfile: true,
        providerProfile: true,
      }
    });

    const tokens = await this.issueTokens(user);
    const { password: _, ...userWithoutPassword } = user;
    return { user: userWithoutPassword, ...tokens };
  }

  static async login(data: any) {
    const user = await prisma.user.findUnique({
      where: { email: data.email },
      include: { providerProfile: true, farmerProfile: true }
    });

    if (!user || !(await verifyPassword(data.password, user.password))) {
      throw new Error('Invalid email or password');
    }

    if (user.role === 'SERVICE_PROVIDER' && user.providerProfile) {
      if (user.providerProfile.approvalStatus === 'PENDING') {
        throw new Error('Your account is pending approval');
      }
      if (user.providerProfile.approvalStatus === 'REJECTED') {
        throw new Error('Your account was rejected. Please contact support.');
      }
    }

    const tokens = await this.issueTokens(user);
    const { password: _, ...userWithoutPassword } = user;
    return { user: userWithoutPassword, ...tokens };
  }

  static async refresh(oldRefreshToken: string) {
    try {
      const decoded = await verifyToken(oldRefreshToken, true);
      const storedToken = await redis.get(`refresh:${decoded.userId}`);

      if (!storedToken || storedToken !== oldRefreshToken) {
        throw new Error('Invalid or expired refresh token');
      }

      const user = await prisma.user.findUnique({
        where: { id: decoded.userId }
      });

      if (!user) throw new Error('User not found');

      const tokens = await this.issueTokens(user);
      return tokens;
    } catch (e) {
      throw new Error('Session expired. Please login again.');
    }
  }

  static async logout(userId: string, accessToken: string, exp: number) {
    await redis.del(`refresh:${userId}`);
    
    const now = Math.floor(Date.now() / 1000);
    const ttl = exp - now;
    if (ttl > 0) {
      await redis.setex(`blacklist:${accessToken}`, ttl, '1');
    }
    await redis.del(`user:${userId}`);
  }

  static async updateLanguage(userId: string, language: 'EN' | 'KN') {
    await prisma.user.update({
      where: { id: userId },
      data: { preferredLanguage: language }
    });
    await redis.del(`user:${userId}`);
  }

  private static async issueTokens(user: any) {
    const payload = { userId: user.id, email: user.email, role: user.role };
    const accessToken = await generateAccessToken(payload);
    const refreshToken = await generateRefreshToken(payload);

    // Store in Redis (TTL 7 days)
    await redis.setex(`refresh:${user.id}`, 7 * 24 * 60 * 60, refreshToken);

    return { accessToken, refreshToken };
  }
}
