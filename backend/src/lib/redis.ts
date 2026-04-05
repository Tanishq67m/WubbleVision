import Redis from 'ioredis';
import dotenv from 'dotenv';

dotenv.config();

// Connect to Upstash or Local Redis
// Use empty string to gracefully falldown to mock if needed, though ioredis natively will try localhost:6379 
const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

export const redis = new Redis(redisUrl, {
  // Graceful fallback for demo purposes if Redis is completely unavailable
  maxRetriesPerRequest: 1,
  retryStrategy(times) {
    if (times > 3) {
      console.warn("⚠️  Could not connect to Redis. Using fallback in-memory state for demo.");
      return null;
    }
    return Math.min(times * 50, 2000);
  }
});

// Mock in-memory cache if Redis fails to connect
const mockCache = new Map<string, string>();
const mockLogs = new Map<string, string[]>();

let IsRedisConnected = false;

redis.on('connect', () => {
  IsRedisConnected = true;
});

redis.on('error', (err: any) => {
  if (err?.code === 'ECONNREFUSED') {
    IsRedisConnected = false;
  }
});

export const getSession = async (key: string): Promise<string | null> => {
  if (IsRedisConnected) {
    try {
      return await redis.get(key);
    } catch (e) {
      return mockCache.get(key) || null;
    }
  }
  return mockCache.get(key) || null;
};

export const setSession = async (key: string, value: string): Promise<void> => {
  if (IsRedisConnected) {
    try {
      await redis.set(key, value);
      return;
    } catch (e) {
      // Fallback
    }
  }
  mockCache.set(key, value);
};

export const appendSessionLog = async (sessionId: string, message: string): Promise<void> => {
  const timestamp = new Date().toISOString();
  const logEntry = JSON.stringify({ timestamp, message });
  const listKey = `session:${sessionId}:logs`;

  if (IsRedisConnected) {
    try {
      await redis.rpush(listKey, logEntry);
      // Keep only 20 most recent logs
      await redis.ltrim(listKey, -20, -1);
      return;
    } catch (e) {
      // Fallback
    }
  }

  const logs = mockLogs.get(sessionId) || [];
  logs.push(logEntry);
  if (logs.length > 20) logs.shift();
  mockLogs.set(sessionId, logs);
};

export const getSessionLogs = async (sessionId: string): Promise<any[]> => {
  const listKey = `session:${sessionId}:logs`;

  if (IsRedisConnected) {
    try {
      const dbLogs = await redis.lrange(listKey, 0, -1);
      return dbLogs.map(l => JSON.parse(l));
    } catch (e) {
      // Fallback
    }
  }
  
  return (mockLogs.get(sessionId) || []).map(l => JSON.parse(l));
};
