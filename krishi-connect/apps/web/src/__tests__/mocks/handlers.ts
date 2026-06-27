import { http, HttpResponse } from 'msw';

export const handlers = [
  // Auth
  http.post('/api/auth/login', () => {
    return HttpResponse.json({
      success: true,
      data: {
        user: { id: 'u1', firstName: 'John', lastName: 'Doe', role: 'FARMER' },
        accessToken: 'mock-access-token',
        refreshToken: 'mock-refresh-token'
      }
    });
  }),

  // Dashboard Stats
  http.get('/api/admin/stats', () => {
    return HttpResponse.json({
      success: true,
      totalFarmers: 2431,
      totalProviders: 1243,
      totalBookings: 3257,
      totalRevenue: 1875000,
      farmerGrowth: 12.5,
      providerGrowth: 8.3,
      bookingGrowth: 15.8,
      revenueGrowth: 18.2
    });
  }),

  // Products
  http.get('/api/farmer/products', () => {
    return HttpResponse.json({
      success: true,
      data: [
        { id: 'p1', name: 'Organic Wheat Seeds', price: 120, category: 'SEEDS', images: [] },
        { id: 'p2', name: 'Urea Fertilizer', price: 600, category: 'FERTILIZERS', images: [] }
      ],
      meta: { page: 1, limit: 10, total: 2, totalPages: 1 }
    });
  }),
];
