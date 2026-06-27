import { describe, it, expect, vi } from 'vitest';
import { rbac } from '../../../middleware/rbac.js';

describe('RBAC Middleware', () => {
  const mockNext = vi.fn();
  const mockStatus = vi.fn().mockReturnThis();
  const mockJson = vi.fn().mockReturnThis();
  const mockRes = { status: mockStatus, json: mockJson } as any;

  it('should allow access for correct role', () => {
    const mockReq = { user: { role: 'ADMIN' } } as any;
    const middleware = rbac('ADMIN');
    
    middleware(mockReq, mockRes, mockNext);
    expect(mockNext).toHaveBeenCalled();
  });

  it('should deny access for incorrect role', () => {
    const mockReq = { user: { role: 'FARMER' } } as any;
    const middleware = rbac('ADMIN');
    
    middleware(mockReq, mockRes, mockNext);
    expect(mockStatus).toHaveBeenCalledWith(403);
    expect(mockJson).toHaveBeenCalledWith(expect.objectContaining({ success: false }));
  });

  it('should allow access if role is in allowed list', () => {
    const mockReq = { user: { role: 'SERVICE_PROVIDER' } } as any;
    const middleware = rbac('ADMIN', 'SERVICE_PROVIDER');
    
    middleware(mockReq, mockRes, mockNext);
    expect(mockNext).toHaveBeenCalled();
  });

  it('should return 401 if user is not attached to request', () => {
    const mockReq = {} as any;
    const middleware = rbac('ADMIN');
    
    middleware(mockReq, mockRes, mockNext);
    expect(mockStatus).toHaveBeenCalledWith(401);
  });
});
