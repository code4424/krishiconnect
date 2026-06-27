import { createServer } from 'http';
import { env } from './config/env.js';
import app from './app.js';
import { initSocket } from './config/socket.js';
import { initWorkers } from './queues/workers/index.js';
import { prisma } from './config/database.js';
import { redis, pubClient, subClient } from './config/redis.js';

const httpServer = createServer(app);

// Initialize real-time components
initSocket(httpServer);
initWorkers();

const PORT = env.PORT || 5000;

// Ensure required DB functions exist before accepting requests
async function ensureDbFunctions() {
  try {
    await prisma.$executeRawUnsafe(`CREATE SEQUENCE IF NOT EXISTS booking_id_seq START 1000;`);
    await prisma.$executeRawUnsafe(`CREATE SEQUENCE IF NOT EXISTS order_id_seq START 1000;`);
    await prisma.$executeRawUnsafe(
      `CREATE OR REPLACE FUNCTION generate_booking_id() RETURNS TEXT AS $$
       BEGIN RETURN 'BK' || LPAD(NEXTVAL('booking_id_seq')::TEXT, 4, '0'); END;
       $$ LANGUAGE plpgsql;`
    );
    await prisma.$executeRawUnsafe(
      `CREATE OR REPLACE FUNCTION generate_order_id() RETURNS TEXT AS $$
       BEGIN RETURN 'ORD' || LPAD(NEXTVAL('order_id_seq')::TEXT, 4, '0'); END;
       $$ LANGUAGE plpgsql;`
    );
    console.log('DB functions verified');
  } catch (err) {
    console.error('Failed to create DB functions:', err);
  }
}

ensureDbFunctions().then(() => {
  httpServer.listen(PORT, () => {
    console.log(`Server running in ${env.NODE_ENV} mode on port ${PORT}`);
  });
});

// --- Graceful Shutdown ---
const gracefulShutdown = async (signal: string) => {
  console.log(`${signal} signal received: closing HTTP server`);
  
  httpServer.close(async () => {
    console.log('HTTP server closed');
    
    // Close Prisma
    await prisma.$disconnect();
    console.log('Prisma disconnected');
    
    // Close Redis
    await redis.quit();
    await pubClient.quit();
    await subClient.quit();
    console.log('Redis disconnected');
    
    process.exit(0);
  });

  // Force close after 30s
  setTimeout(() => {
    console.error('Could not close connections in time, forcefully shutting down');
    process.exit(1);
  }, 30000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
