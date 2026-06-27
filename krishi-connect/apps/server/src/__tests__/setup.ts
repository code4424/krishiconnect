import { vi, beforeAll, afterAll } from 'vitest';
import dotenv from 'dotenv';
import path from 'path';

// Load test environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.test') });

// Mock Redis
vi.mock('../config/redis.js', () => ({
  redis: {
    get: vi.fn(),
    setex: vi.fn(),
    del: vi.fn(),
    incr: vi.fn(),
    expire: vi.fn(),
    pexpire: vi.fn(),
  },
  pubClient: {
    duplicate: vi.fn(() => ({
      on: vi.fn(),
      connect: vi.fn(),
    })),
  },
  subClient: {
    on: vi.fn(),
    connect: vi.fn(),
  },
  redisConnectionOptions: {},
}));

// Mock BullMQ
vi.mock('bullmq', () => ({
  Queue: vi.fn().mockImplementation(() => ({
    add: vi.fn(),
  })),
  Worker: vi.fn().mockImplementation(() => ({
    on: vi.fn(),
    close: vi.fn(),
  })),
}));

// Mock Socket.IO
vi.mock('../config/socket.js', () => ({
  io: {
    to: vi.fn().mockReturnThis(),
    emit: vi.fn(),
  },
  initSocket: vi.fn(),
}));

beforeAll(() => {
  // Global setup
});

afterAll(() => {
  // Global teardown
});
