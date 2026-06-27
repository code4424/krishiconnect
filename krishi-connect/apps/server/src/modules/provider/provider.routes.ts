import { Router } from 'express';
import { ProviderController } from './provider.controller.js';
import { authenticate } from '../../middleware/auth.js';
import { rbac } from '../../middleware/rbac.js';

const router = Router();

router.use(authenticate, rbac('SERVICE_PROVIDER'));

router.get('/stats', ProviderController.getStats);
router.get('/earnings-chart', ProviderController.getEarningsChart);
router.get('/booking-status-overview', ProviderController.getBookingStatusOverview);
router.get('/upcoming-bookings', ProviderController.getUpcomingBookings);
router.get('/recent-orders', ProviderController.getRecentOrders);

// Services
router.get('/services', ProviderController.getServices);
router.get('/services/:id', ProviderController.getServiceById);
router.post('/services', ProviderController.createService);
router.put('/services/:id', ProviderController.updateService);
router.delete('/services/:id', ProviderController.deleteService);

// Products
router.get('/products', ProviderController.getProducts);
router.get('/products/:id', ProviderController.getProductById);
router.post('/products', ProviderController.createProduct);
router.put('/products/:id', ProviderController.updateProduct);
router.delete('/products/:id', ProviderController.deleteProduct);

// Orders
router.get('/orders', ProviderController.getOrders);
router.put('/orders/:id/status', ProviderController.updateOrderStatus);

// Bookings
router.get('/bookings', ProviderController.getBookings);
router.get('/bookings/:id', ProviderController.getBookingById);
router.put('/bookings/:id/status', ProviderController.updateBookingStatus);

// Earnings
router.get('/earnings/summary', ProviderController.getEarningsSummary);
router.get('/earnings/transactions', ProviderController.getEarningsTransactions);

// Profile
router.get('/profile', ProviderController.getProfile);
router.put('/profile', ProviderController.updateProfile);

export { router as providerRoutes };
