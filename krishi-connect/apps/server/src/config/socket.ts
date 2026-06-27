import { Server } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import { pubClient, subClient } from './redis.js';
import { verifyToken } from '../utils/jwt.js';
import { Server as HttpServer } from 'http';
import { env } from './env.js';

export let io: Server;

export const initSocket = (server: HttpServer) => {
  io = new Server(server, {
    cors: {
      origin: env.CORS_ORIGIN,
      methods: ['GET', 'POST'],
      credentials: true
    }
  });

  io.adapter(createAdapter(pubClient, subClient));

  // Authentication Middleware for Sockets
  io.use(async (socket, next) => {
    // Try cookie first, then fall back to auth.token for backward compat
    let token = socket.handshake.auth.token;
    if (!token) {
      const cookieHeader = socket.handshake.headers.cookie || '';
      const match = cookieHeader.match(/(?:^|;\s*)accessToken=([^;]+)/);
      if (match) token = decodeURIComponent(match[1]);
    }
    if (!token) {
      return next(new Error('Authentication error'));
    }

    try {
      const decoded = await verifyToken(token);
      (socket as any).userId = decoded.userId;
      (socket as any).role = decoded.role;
      next();
    } catch (err) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    const userId = (socket as any).userId;
    const role = (socket as any).role;

    console.log(`User connected: ${userId} (${role})`);

    // Join common rooms
    socket.join(`user:${userId}`);
    if (role === 'ADMIN') socket.join('admin');
    if (role === 'SERVICE_PROVIDER') socket.join(`provider:${userId}`);

    // Join specific booking rooms dynamically
    socket.on('booking:join', (bookingId: string) => {
      socket.join(`booking:${bookingId}`);
    });

    socket.on('booking:leave', (bookingId: string) => {
      socket.leave(`booking:${bookingId}`);
    });

    // Real-time location tracking from provider
    socket.on('tracking:location', (data: { bookingId: string, lat: number, lng: number }) => {
      if (role === 'SERVICE_PROVIDER') {
        io.to(`booking:${data.bookingId}`).emit('booking:location', data);
      }
    });

    socket.on('disconnect', () => {
      console.log(`User disconnected: ${userId}`);
    });
  });

  return io;
};
