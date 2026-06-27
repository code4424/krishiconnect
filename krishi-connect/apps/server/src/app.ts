import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { env } from './config/env.js';
import { corsOptions } from './config/cors.js';
import { errorHandler } from './middleware/errorHandler.js';
import { authRoutes } from './modules/auth/auth.routes.js';
import { serviceRoutes } from './modules/services/service.routes.js';
import { bookingRoutes } from './modules/bookings/booking.routes.js';
import { productRoutes } from './modules/products/product.routes.js';
import { orderRoutes } from './modules/orders/order.routes.js';
import { adminRoutes } from './modules/admin/admin.routes.js';
import { providerRoutes } from './modules/provider/provider.routes.js';
import { farmerRoutes } from './modules/farmer/farmer.routes.js';
import { uploadRoutes } from './modules/upload/upload.routes.js';
import { paymentRoutes } from './modules/payments/payment.routes.js';
import { notificationRoutes } from './modules/notifications/notification.routes.js';
import { geocodeRoutes } from './modules/geocode/geocode.routes.js';

const app = express();

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: false,
}));
app.use(cors(corsOptions));
app.use(cookieParser());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Static files for uploads
app.use('/uploads', express.static(env.UPLOAD_DIR));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/provider', providerRoutes);
app.use('/api/farmer', farmerRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/geocode', geocodeRoutes);

// Error handling
app.use(errorHandler);

export default app;
