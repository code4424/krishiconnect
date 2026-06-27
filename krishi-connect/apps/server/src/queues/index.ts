import { Queue, Worker, Job } from 'bullmq';
import { redisConnectionOptions } from '../config/redis.js';

const defaultJobOptions = {
  attempts: 3,
  backoff: { type: 'exponential', delay: 2000 },
  removeOnComplete: { count: 1000, age: 24 * 3600 },
  removeOnFail: { count: 5000, age: 7 * 24 * 3600 }
};

export const emailQueue = new Queue('email', { 
  connection: redisConnectionOptions,
  defaultJobOptions 
});

export const smsQueue = new Queue('sms', { 
  connection: redisConnectionOptions,
  defaultJobOptions 
});

export const notificationQueue = new Queue('notification', { 
  connection: redisConnectionOptions,
  defaultJobOptions 
});

export const imageQueue = new Queue('image', { 
  connection: redisConnectionOptions,
  defaultJobOptions 
});

export const reportQueue = new Queue('report', { 
  connection: redisConnectionOptions,
  defaultJobOptions 
});
