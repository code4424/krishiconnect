import { Router } from 'express';
import { AdminController } from './admin.controller.js';
import { authenticate } from '../../middleware/auth.js';
import { rbac } from '../../middleware/rbac.js';

const router = Router();

router.use(authenticate, rbac('ADMIN'));

router.get('/stats', AdminController.getStats);
router.get('/revenue-chart', AdminController.getRevenueChart);
router.get('/bookings-overview', AdminController.getBookingsOverview);
router.get('/recent-activities', AdminController.getRecentActivities);
router.get('/top-services', AdminController.getTopServices);

// Provider Management
router.get('/providers', AdminController.getProviders);
router.get('/providers/:id', AdminController.getProviderById);
router.put('/providers/:id/status', AdminController.updateProviderStatus);

// Product Management
router.get('/products', AdminController.getProducts);
router.put('/products/:id/status', AdminController.updateProductStatus);

// Booking Management
router.get('/bookings', AdminController.getBookings);

// Order Management
router.get('/orders', AdminController.getOrders);

// Reports & Analytics
router.get('/reports/summary', AdminController.getReportsSummary);
router.get('/reports/revenue-growth', AdminController.getRevenueGrowth);

// Platform Settings
router.get('/settings', AdminController.getSettings);
router.put('/settings', AdminController.updateSettings);

// Data Export
router.get('/providers/export', AdminController.exportProviders);
router.get('/products/export', AdminController.exportProducts);
router.get('/bookings/export', AdminController.exportBookings);
router.get('/orders/export', AdminController.exportOrders);

export { router as adminRoutes };
