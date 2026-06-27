import { describe, it, expect } from 'vitest';
import { calculateDistance, isValidCoordinates } from '../../../utils/geolocation.js';

describe('Geolocation Utils', () => {
  describe('calculateDistance', () => {
    it('should return 0 for the same point', () => {
      const distance = calculateDistance(12.9716, 77.5946, 12.9716, 77.5946);
      expect(distance).toBe(0);
    });

    it('should calculate correct distance between Bangalore and Mysore', () => {
      // Approx 140km
      const distance = calculateDistance(12.9716, 77.5946, 12.2958, 76.6394);
      expect(distance).toBeGreaterThan(135);
      expect(distance).toBeLessThan(150);
    });
  });

  describe('isValidCoordinates', () => {
    it('should return true for valid coordinates', () => {
      expect(isValidCoordinates(12.9716, 77.5946)).toBe(true);
      expect(isValidCoordinates(0, 0)).toBe(true);
      expect(isValidCoordinates(90, 180)).toBe(true);
      expect(isValidCoordinates(-90, -180)).toBe(true);
    });

    it('should return false for invalid latitude', () => {
      expect(isValidCoordinates(91, 77)).toBe(false);
      expect(isValidCoordinates(-91, 77)).toBe(false);
    });

    it('should return false for invalid longitude', () => {
      expect(isValidCoordinates(12, 181)).toBe(false);
      expect(isValidCoordinates(12, -181)).toBe(false);
    });
  });
});
