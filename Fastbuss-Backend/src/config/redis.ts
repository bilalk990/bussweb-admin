import dotenv from 'dotenv';
dotenv.config();

// In-memory fallback store
const memoryStore: Record<string, string> = {};

const mockClient = {
  set: async (key: string, value: string, options?: any) => { memoryStore[key] = value; return 'OK'; },
  get: async (key: string) => memoryStore[key] || null,
  del: async (key: string) => { delete memoryStore[key]; return 1; },
  on: () => {},
  isReady: true,
};

export default mockClient;
