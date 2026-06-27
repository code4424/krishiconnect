import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { api } from '@/lib/api';

interface LocationState {
  lat: number;
  lng: number;
  address: string;
  pincode: string;
  isCustom: boolean;
  isPermissionDenied: boolean;
  setLocation: (lat: number, lng: number, address: string, pincode?: string, isCustom?: boolean) => void;
  requestCurrentLocation: () => Promise<void>;
  updateByPincode: (pincode: string) => Promise<void>;
}

export const useLocationStore = create<LocationState>()(
  persist(
    (set, _get) => ({
      lat: 12.9716, // Default to Bangalore
      lng: 77.5946,
      address: 'Bangalore, KA',
      pincode: '',
      isCustom: false,
      isPermissionDenied: false,

      setLocation: (lat, lng, address, pincode = '', isCustom = true) => 
        set({ lat, lng, address, pincode, isCustom }),

      requestCurrentLocation: async () => {
        if (!navigator.geolocation) return;
        
        return new Promise((resolve) => {
          navigator.geolocation.getCurrentPosition(
            async (pos) => {
              const { latitude, longitude } = pos.coords;
              try {
                const res = await api.get('/geocode/reverse', { params: { lat: latitude, lng: longitude } });
                const data = res.data.data;
                const city = data.address?.city || data.address?.town || data.address?.village || 'Unknown';
                const state = data.address?.state || '';
                const pc = data.address?.postcode || '';
                
                set({ 
                  lat: latitude, 
                  lng: longitude,
                  address: `${city}, ${state}`,
                  pincode: pc,
                  isCustom: false,
                  isPermissionDenied: false
                });
              } catch (e) {
                set({ 
                  lat: latitude, 
                  lng: longitude,
                  address: 'Current Location',
                  isCustom: false,
                  isPermissionDenied: false
                });
              }
              resolve();
            },
            (error) => {
              if (error.code === error.PERMISSION_DENIED) {
                set({ isPermissionDenied: true });
              }
              resolve();
            },
            { enableHighAccuracy: true }
          );
        });
      },

      updateByPincode: async (pincode: string) => {
        try {
          const res = await api.get('/geocode/search', { params: { q: pincode } });
          const results = res.data.data;
          if (results && results.length > 0) {
            const { lat, lon, display_name } = results[0];
            const parts = display_name.split(',');
            const cityState = parts.length > 2 ? `${parts[0].trim()}, ${parts[1].trim()}` : display_name;
            
            set({
              lat: parseFloat(lat),
              lng: parseFloat(lon),
              address: cityState,
              pincode: pincode,
              isCustom: true
            });
          } else {
            throw new Error('Pincode not found');
          }
        } catch (e) {
          throw e;
        }
      }
    }),
    { name: 'location-storage' }
  )
);
