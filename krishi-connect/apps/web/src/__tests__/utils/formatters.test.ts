import { describe, it, expect } from 'vitest';
import { formatIndianCurrency, formatNumber } from '@/lib/formatters';

describe('Formatters', () => {
  describe('formatIndianCurrency', () => {
    it('should format 1875000 as "₹18,75,000"', () => {
      // Note: Intl might use non-breaking spaces, using a regex or simple check
      const result = formatIndianCurrency(1875000);
      expect(result.replace(/\u00A0/g, ' ')).toContain('₹18,75,000');
    });

    it('should format 120 as "₹120"', () => {
      const result = formatIndianCurrency(120);
      expect(result.replace(/\u00A0/g, ' ')).toContain('₹120');
    });

    it('should format 2400 as "₹2,400"', () => {
      const result = formatIndianCurrency(2400);
      expect(result.replace(/\u00A0/g, ' ')).toContain('₹2,400');
    });
  });

  describe('formatNumber', () => {
    it('should format 3257 with Indian grouping as "3,257"', () => {
      const result = formatNumber(3257);
      expect(result).toBe('3,257');
    });
  });
});
