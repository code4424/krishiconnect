import * as jose from 'jose';
import { env } from '../config/env.js';
import { Role } from '@krishi/shared';

const ACCESS_SECRET = new TextEncoder().encode(env.JWT_SECRET);
const REFRESH_SECRET = new TextEncoder().encode(env.JWT_REFRESH_SECRET);

export interface TokenPayload {
  userId: string;
  email: string;
  role: Role;
}

export const generateAccessToken = async (payload: TokenPayload): Promise<string> => {
  return new jose.SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(env.JWT_EXPIRES_IN) // e.g., "15m"
    .sign(ACCESS_SECRET);
};

export const generateRefreshToken = async (payload: TokenPayload): Promise<string> => {
  return new jose.SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(env.JWT_REFRESH_EXPIRES_IN) // e.g., "7d"
    .sign(REFRESH_SECRET);
};

export const verifyToken = async (token: string, isRefresh = false) => {
  const secret = isRefresh ? REFRESH_SECRET : ACCESS_SECRET;
  const { payload } = await jose.jwtVerify(token, secret);
  return payload as unknown as TokenPayload & { exp: number };
};
