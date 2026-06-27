import { describe, it, expect } from 'vitest';
import { getPaginationOptions, formatPaginatedResponse } from '../../../utils/pagination.js';

describe('Pagination Utils', () => {
  describe('getPaginationOptions', () => {
    it('should return default values for empty query', () => {
      const options = getPaginationOptions({});
      expect(options).toEqual({ page: 1, limit: 10, skip: 0 });
    });

    it('should parse page and limit correctly', () => {
      const options = getPaginationOptions({ page: '2', limit: '20' });
      expect(options).toEqual({ page: 2, limit: 20, skip: 20 });
    });

    it('should enforce minimum page 1', () => {
      const options = getPaginationOptions({ page: '0' });
      expect(options.page).toBe(1);
    });

    it('should enforce maximum limit 100', () => {
      const options = getPaginationOptions({ limit: '500' });
      expect(options.limit).toBe(100);
    });
  });

  describe('formatPaginatedResponse', () => {
    it('should format response correctly', () => {
      const data = [{ id: 1 }, { id: 2 }];
      const response = formatPaginatedResponse(data, 10, 1, 2);
      expect(response).toEqual({
        success: true,
        data,
        meta: { page: 1, limit: 2, total: 10 }
      });
    });
  });
});
