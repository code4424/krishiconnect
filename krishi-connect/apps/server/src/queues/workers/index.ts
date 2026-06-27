import { Worker, Job } from 'bullmq';
import { redisConnectionOptions } from '../../config/redis.js';
import { prisma } from '../../config/database.js';
import { io } from '../../config/socket.js';

export const initWorkers = () => {
  // 1. Email Worker
  new Worker('email', async (job: Job) => {
    console.log(`Processing email job: ${job.id} for type: ${job.data.type}`);
    // Use nodemailer here
  }, { connection: redisConnectionOptions });

  // 2. Notification Worker (In-app + Sockets)
  new Worker('notification', async (job: Job) => {
    const { userId, title, message, type, metadata, room } = job.data;
    
    // Save to DB
    const notification = await prisma.notification.create({
      data: { userId, title, message, type, metadata }
    });

    // Emit Socket.IO
    if (io) {
      if (room) {
        io.to(room).emit('notification:new', notification);
      } else {
        io.to(`user:${userId}`).emit('notification:new', notification);
      }
    }
  }, { connection: redisConnectionOptions });

  // 3. Image Processing Worker
  new Worker('image', async (job: Job) => {
    console.log(`Processing image job: ${job.id}`);
    // Use sharp here to resize and optimize
  }, { connection: redisConnectionOptions });

  // 4. Report Worker
  new Worker('report', async (job: Job) => {
    console.log(`Processing report job: ${job.id}`);
    // Generate CSV and store in tmp/cloud
  }, { connection: redisConnectionOptions });
};
