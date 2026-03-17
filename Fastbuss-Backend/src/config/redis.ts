import { createClient } from 'redis';
import dotenv from 'dotenv';
dotenv.config();

// In-memory fallback when Redis is not available
const memoryStore: Record<string, string> = {};

const mockClient = {
  set: async (key: string, value: string, options?: any) => { memoryStore[key] = value; return 'OK'; },
  get: async (key: string) => memoryStore[key] || null,
  del: async (key: string) => { delete memoryStore[key]; return 1; },
  on: () => {},
  connect: async () => {},
  isReady: true,
};

let redisClient: any = mockClient;

if (process.env.REDIS_URL) {
  const client = createClient({
    username: process.env.REDIS_USERNAME,
    password: process.env.REDIS_PASSWORD,
    socket: {
      host: process.env.REDIS_URL,
      port: Number(process.env.REDIS_PORT) || 6379,
    }
  });

  client.on('error', (err) => console.error('Redis Client Error - using memory fallback:', err));

  client.connect()
    .then(() => {
      console.log('Redis connected');
      redisClient = client;
    })
    .catch((err) => {
      console.error('Redis connection failed - using memory fallback:', err);
    });
}

export default redisClient;
