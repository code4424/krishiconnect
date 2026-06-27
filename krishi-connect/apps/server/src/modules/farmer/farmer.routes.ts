import { Router } from 'express';
import { FarmerController } from './farmer.controller.js';
import { authenticate } from '../../middleware/auth.js';
import { rbac } from '../../middleware/rbac.js';

import { idempotencyCheck } from '../../middleware/idempotency.js';

const router = Router();

router.use(authenticate, rbac('FARMER'));

router.get('/dashboard', FarmerController.getDashboard);
router.get('/services', FarmerController.searchServices);
router.get('/services/map', FarmerController.getServicesMap);
router.get('/services/:id', FarmerController.getServiceById);
router.get('/services/:id/available-slots', FarmerController.getAvailableSlots);

// Bookings
router.post('/bookings', idempotencyCheck, FarmerController.createBooking);
router.get('/bookings', FarmerController.getBookings);
router.get('/bookings/:id', FarmerController.getBookingById);
router.put('/bookings/:id/cancel', FarmerController.cancelBooking);

// Products
router.get('/products', FarmerController.getProducts);
router.get('/products/:id', FarmerController.getProductById);

// Orders
router.post('/orders', idempotencyCheck, FarmerController.createOrder);
router.get('/orders', FarmerController.getOrders);
router.get('/orders/:id', FarmerController.getOrderById);
router.put('/orders/:id/cancel', FarmerController.cancelOrder);

// Platform Settings (for checkout charges display)
router.get('/platform-settings', FarmerController.getPlatformSettings);

// Addresses
router.get('/addresses', FarmerController.getAddresses);
router.post('/addresses', FarmerController.addAddress);
router.put('/addresses/:id', FarmerController.updateAddress);
router.delete('/addresses/:id', FarmerController.deleteAddress);

export { router as farmerRoutes };
