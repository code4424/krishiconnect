import { describe, it, expect, vi } from 'vitest';
import { generateAccessToken, verifyToken } from '../../../utils/jwt.js';

describe('JWT Utils', () => {
  const payload = { userId: '123', email: 'test@example.com', role: 'FARMER' as any };

  it('should generate and verify a valid access token', async () => {
    const token = await generateAccessToken(payload);
    expect(token).toBeDefined();
    
    const decoded = await verifyToken(token);
    expect(decoded.userId).toBe(payload.userId);
    expect(decoded.email).toBe(payload.email);
    expect(decoded.role).toBe(payload.role);
  });

  it('should throw error for invalid token', async () => {
    await expect(verifyToken('invalid.token.here')).rejects.toThrow();
  });
});
