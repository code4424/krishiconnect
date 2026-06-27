export * from './user.js';
export * from './service.js';
export * from './booking.js';
export * from './product.js';
export * from './order.js';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  meta?: {
    page: number;
    limit: number;
    total: number;
  };
}
