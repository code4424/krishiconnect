import { describe, it, expect } from 'vitest';
import { registerSchema, loginSchema } from '../../../validators/auth.js';

describe('Auth Validators', () => {
  describe('loginSchema', () => {
    it('should validate correct login data', () => {
      const result = loginSchema.safeParse({ email: 'test@example.com', password: 'password123' });
      expect(result.success).toBe(true);
    });

    it('should fail for invalid email', () => {
      const result = loginSchema.safeParse({ email: 'not-an-email', password: 'password123' });
      expect(result.success).toBe(false);
    });

    it('should fail for empty password', () => {
      const result = loginSchema.safeParse({ email: 'test@example.com', password: '' });
      expect(result.success).toBe(false);
    });
  });

  describe('registerSchema', () => {
    it('should validate correct registration data', () => {
      const result = registerSchema.safeParse({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        phone: '9876543210',
        password: 'password123',
        role: 'FARMER'
      });
      expect(result.success).toBe(true);
    });

    it('should fail for short password', () => {
      const result = registerSchema.safeParse({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        phone: '9876543210',
        password: 'short',
        role: 'FARMER'
      });
      expect(result.success).toBe(false);
    });

    it('should fail for invalid phone', () => {
      const result = registerSchema.safeParse({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        phone: '12345',
        password: 'password123',
        role: 'FARMER'
      });
      expect(result.success).toBe(false);
    });
  });
});
